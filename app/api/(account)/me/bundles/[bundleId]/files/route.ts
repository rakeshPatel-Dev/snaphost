import { NextResponse } from 'next/server'
import { getCurrentAppUser } from '@/lib/server/auth-user'
import { getAuthUserFromRequest } from '@/lib/server/auth-server'
import { validateFileContent, getFileType } from '@/lib/fileValidation'
import { sanitizeFilename } from '@/lib/sanitizeFilename'
import { createFileIdSync } from '@/lib/generateFileId'
import { deleteFileFromStorage, uploadBundleFileToStorage } from '@/lib/server/storage'
import {
  countActiveBundleFiles,
  getBundleForUser,
  insertBundleFile,
} from '@/lib/server/bundle-admin'
import { CONFIG } from '@/lib/config'
import {
  getClientIp,
  limitAccountUploads,
  limitUploadIpBurst,
  rateLimitResponse,
} from '@/lib/server/upload-rate-limit'

export const maxDuration = 60
type Context = { params: Promise<{ bundleId: string }> }

export async function POST(request: Request, { params }: Context) {
  const authUser = await getAuthUserFromRequest(request)
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getCurrentAppUser({
    authUserId: authUser.id,
    email: authUser.email,
    usernameHint: authUser.usernameHint,
  })
  if (!user) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { bundleId } = await params
  const bundle = await getBundleForUser(bundleId, user.id)
  if (!bundle) return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
  const maxFiles =
    user.tier === 'premium' ? CONFIG.MAX_BUNDLE_FILES_PREMIUM : CONFIG.MAX_BUNDLE_FILES_FREE
  if ((await countActiveBundleFiles(bundleId)) >= maxFiles) {
    return NextResponse.json({ error: 'Bundle file limit reached' }, { status: 422 })
  }

  const ipBurst = await limitUploadIpBurst(getClientIp(request.headers))
  if (!ipBurst.success) return rateLimitResponse(ipBurst, 'Upload rate limit reached')
  const accountDaily = await limitAccountUploads(user.id, user.tier)
  if (!accountDaily.success) return rateLimitResponse(accountDaily, 'Upload rate limit reached')

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File))
    return NextResponse.json({ error: 'No file was attached' }, { status: 400 })

  const validation = await validateFileContent(file)
  if (!validation.valid || !validation.mimeType) {
    return NextResponse.json({ error: 'File validation failed' }, { status: 400 })
  }

  const expiresAtInput = formData.get('expiresAt')
  let expiresAt: string | null = null
  if (typeof expiresAtInput === 'string' && expiresAtInput.trim()) {
    const parsed = new Date(expiresAtInput)
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Invalid expiration date' }, { status: 400 })
    }
    expiresAt = parsed.toISOString()
  }

  const fileId = createFileIdSync()
  const sanitizedName = sanitizeFilename(file.name)
  const { path, error: storageError } = await uploadBundleFileToStorage(
    bundleId,
    fileId,
    file,
    validation.mimeType
  )
  if (storageError || !path)
    return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })

  try {
    const record = await insertBundleFile({
      bundleId,
      userId: user.id,
      filename: sanitizedName,
      fileType: getFileType(validation.mimeType),
      mimeType: validation.mimeType,
      size: file.size,
      storagePath: path,
      expiresAt,
    })
    return NextResponse.json({ success: true, file: record }, { status: 201 })
  } catch (error) {
    await deleteFileFromStorage(path)
    if (String(error).toLowerCase().includes('bundle file limit'))
      return NextResponse.json({ error: 'Bundle file limit reached' }, { status: 422 })
    console.error('Bundle file insert failed:', error)
    return NextResponse.json({ error: 'Could not save bundle file' }, { status: 500 })
  }
}
