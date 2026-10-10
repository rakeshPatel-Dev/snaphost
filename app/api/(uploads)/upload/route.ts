import { after, NextRequest, NextResponse } from 'next/server'
import { SeverityNumber } from '@opentelemetry/api-logs'
import { posthogLogger, posthogLoggerProvider, posthogLogsConfigured } from '@/instrumentation'
import { validateFileContent, getFileType } from '@/lib/fileValidation'
import { sanitizeFilename } from '@/lib/sanitizeFilename'
import { createFileIdSync } from '@/lib/generateFileId'
import { deleteFileFromStorage, uploadFileToStorage } from '@/lib/server/storage'
import {
  createFileRecord,
  buildFileUrl,
  countTotalActiveLinksForUser,
} from '@/lib/server/file-admin'
import { CONFIG } from '@/lib/config'
import { supabaseAdmin } from '@/lib/server/supabase-admin'
import crypto from 'crypto'
import { getCurrentAppUser } from '@/lib/server/auth-user'
import { getAuthUserFromRequest } from '@/lib/server/auth-server'
import {
  getClientIp,
  limitAccountUploads,
  limitAnonymousUploads,
  limitUploadIpBurst,
  rateLimitResponse,
} from '@/lib/server/upload-rate-limit'
import { UPLOAD_ERRORS, ANON_ERRORS, SERVER_ERRORS } from '@/lib/messages'

export const maxDuration = 60 // 60 seconds for file upload

export async function POST(request: NextRequest) {
  let uploadedStoragePath: string | null = null
  let currentUploadType: 'anonymous' | 'custom' | null = null
  try {
    // Rate-limit before parsing multipart data so rejected uploads do not consume memory.
    const ip = getClientIp(request.headers)
    const ipBurst = await limitUploadIpBurst(ip)
    if (!ipBurst.success) {
      return rateLimitResponse(ipBurst, UPLOAD_ERRORS.rateLimited)
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: UPLOAD_ERRORS.noFileProvided }, { status: 400 })
    }

    // Explicit anon mode ignores Bearer so logged-in dropzone uploads never attach to an account.
    const forceAnonymous = formData.get('mode') === 'anonymous'

    let userRecord = null
    if (!forceAnonymous) {
      const authUser = await getAuthUserFromRequest(request)
      const authUserId = authUser?.id ?? null

      if (authUserId && authUser?.email) {
        userRecord = await getCurrentAppUser({
          authUserId,
          email: authUser.email,
          usernameHint: authUser.usernameHint,
        })

        const accountDaily = await limitAccountUploads(userRecord.id, userRecord.tier)
        if (!accountDaily.success) {
          return rateLimitResponse(
            accountDaily,
            userRecord.tier === 'free'
              ? UPLOAD_ERRORS.freePlanLimitReached
              : UPLOAD_ERRORS.rateLimited
          )
        }
      }
    }

    const uploadType = forceAnonymous || !userRecord ? 'anonymous' : 'custom'
    currentUploadType = uploadType

    if (uploadType === 'anonymous') {
      const anonymousDaily = await limitAnonymousUploads(ip)
      if (!anonymousDaily.success) {
        return rateLimitResponse(anonymousDaily, ANON_ERRORS.dailyUploadLimitReached)
      }
    }

    // Validate file
    const validation = await validateFileContent(file)
    if (!validation.valid || !validation.mimeType) {
      return NextResponse.json(
        {
          error: UPLOAD_ERRORS.fileValidationFailed,
          details: validation.errors.map((e) => e.message),
        },
        { status: 400 }
      )
    }

    // Sanitize filename
    const sanitizedName = sanitizeFilename(file.name)
    const verifiedMimeType = validation.mimeType
    const fileType = getFileType(verifiedMimeType)

    // Generate unique file ID
    const slug = createFileIdSync()
    const expiresAtInput = formData.get('expiresAt')

    // Enforce free-tier file limit: free users can have at most 5 active links.
    if (uploadType === 'custom' && userRecord && userRecord.tier === 'free') {
      const currentCount = await countTotalActiveLinksForUser(userRecord.id)
      if (currentCount >= CONFIG.MAX_ACTIVE_LINKS_FREE) {
        return NextResponse.json({ error: UPLOAD_ERRORS.freePlanLimitReached }, { status: 403 })
      }
    }

    let expiresAt: string | null = null
    if (uploadType === 'anonymous') {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    } else if (typeof expiresAtInput === 'string' && expiresAtInput.trim()) {
      const parsed = new Date(expiresAtInput)
      if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
        return NextResponse.json({ error: UPLOAD_ERRORS.invalidExpirationDate }, { status: 400 })
      }
      expiresAt = parsed.toISOString()
    }

    // Upload to storage
    const { path, error: storageError } = await uploadFileToStorage(slug, file, verifiedMimeType)
    uploadedStoragePath = path || null

    if (storageError) {
      return NextResponse.json({ error: UPLOAD_ERRORS.storageFailed }, { status: 500 })
    }

    // For anonymous uploads attach or create a secure session
    let anonSessionId: string | null = null
    let rawAnonToken: string | null = null

    if (uploadType === 'anonymous') {
      // read cookie
      const cookieValue = request.cookies.get('anon_session')?.value ?? null

      const now = new Date()
      const expiresAtIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      if (cookieValue) {
        try {
          const tokenHash = crypto.createHash('sha256').update(cookieValue).digest('hex')
          const { data: existing } = await supabaseAdmin
            .from('anon_sessions')
            .select('id, expires_at, revoked_at')
            .eq('token_hash', tokenHash)
            .maybeSingle()

          if (!existing || existing.revoked_at || new Date(existing.expires_at) <= now) {
            // fall through to create a new session
          } else {
            anonSessionId = existing.id
          }
        } catch {
          // ignore and create new session
        }
      }

      if (!anonSessionId) {
        // create a new secure random token and store only its hash in DB
        const rawToken = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

        const { data: ins, error: insErr } = await supabaseAdmin
          .from('anon_sessions')
          .insert({
            token_hash: tokenHash,
            expires_at: expiresAtIso,
          })
          .select('id')
          .single()

        if (insErr || !ins) {
          console.error('Failed to create anon session', insErr)
          if (uploadedStoragePath) {
            await deleteFileFromStorage(uploadedStoragePath)
          }
          return NextResponse.json({ error: SERVER_ERRORS.internalError }, { status: 500 })
        } else {
          anonSessionId = ins.id
          rawAnonToken = rawToken
        }
      }
    }

    let fileRecord

    try {
      // Insert metadata into database
      fileRecord = await createFileRecord({
        userId: uploadType === 'custom' ? (userRecord?.id ?? null) : null,
        uploadType,
        slug,
        filename: sanitizedName,
        fileType: fileType as 'pdf' | 'image',
        mimeType: verifiedMimeType,
        size: file.size,
        storagePath: path,
        expiresAt,
        anonSessionId: anonSessionId ?? null,
      })
    } catch (dbError) {
      const dbRecord = dbError as {
        code?: string
        message?: string
        details?: string
        hint?: string
      } | null
      const dbText = [
        dbRecord?.code,
        dbRecord?.message,
        dbRecord?.details,
        dbRecord?.hint,
        String(dbError),
      ]
        .filter(Boolean)
        .join(' ')

      // If the anon-session limit trigger rejects the insert, clean up the uploaded blob and return 403.
      if (currentUploadType === 'anonymous' && dbText.includes('anon session link limit reached')) {
        if (uploadedStoragePath) {
          await deleteFileFromStorage(uploadedStoragePath)
        }
        return NextResponse.json(
          { error: ANON_ERRORS.linkLimitReached, details: ANON_ERRORS.linkLimitReached },
          { status: 403 }
        )
      }

      // Any other DB failure should also clean up the uploaded blob.
      if (uploadedStoragePath) {
        await deleteFileFromStorage(uploadedStoragePath)
      }
      throw dbError
    }

    // Return success with shareable URL
    const shareUrl = buildFileUrl(
      fileRecord,
      uploadType === 'custom' ? userRecord?.username : undefined
    )

    const responseBody = {
      success: true,
      fileId: slug,
      filename: sanitizedName,
      url: shareUrl,
      expiresAt: fileRecord.expires_at,
    }

    const response = NextResponse.json(responseBody, { status: 201 })

    if (posthogLogsConfigured) {
      posthogLogger.emit({
        body: 'upload_completed',
        severityNumber: SeverityNumber.INFO,
        attributes: {
          'upload.type': uploadType,
          'file.type': fileType,
          'expiration.configured': Boolean(fileRecord.expires_at),
        },
      })
      after(async () => {
        await posthogLoggerProvider.forceFlush()
      })
    }

    if (rawAnonToken) {
      response.cookies.set({
        name: 'anon_session',
        value: rawAnonToken,
        httpOnly: true,
        secure: request.nextUrl.protocol === 'https:',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      })
    }

    return response
  } catch (error) {
    console.error('Upload route error:', error)
    if (posthogLogsConfigured) {
      posthogLogger.emit({
        body: 'upload_failed',
        severityNumber: SeverityNumber.ERROR,
        attributes: { 'upload.type': currentUploadType ?? 'undetermined' },
      })
      after(async () => {
        await posthogLoggerProvider.forceFlush()
      })
    }
    return NextResponse.json({ error: SERVER_ERRORS.internalError }, { status: 500 })
  }
}
