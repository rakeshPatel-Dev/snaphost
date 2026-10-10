import { NextResponse } from 'next/server'
import { getCurrentAppUser } from '@/lib/server/auth-user'
import { getAuthUserFromRequest } from '@/lib/server/auth-server'
import { validateFileContent, getFileType } from '@/lib/fileValidation'
import { sanitizeFilename } from '@/lib/sanitizeFilename'
import {
  countActiveBundleFiles,
  deleteBundleFile,
  deleteBundleForUser,
  getBundleFileForUser,
  replaceBundleFileInDatabase,
  updateBundleFileExpirationForUser,
} from '@/lib/server/bundle-admin'
import { deleteFileFromStorage, uploadBundleFileToStorage } from '@/lib/server/storage'
import { createFileIdSync } from '@/lib/generateFileId'
import {
  getClientIp,
  limitAccountUploads,
  limitUploadIpBurst,
  rateLimitResponse,
} from '@/lib/server/upload-rate-limit'

type Context = { params: Promise<{ bundleId: string; fileId: string }> }

async function getUser(request: Request) {
  const authUser = await getAuthUserFromRequest(request)
  if (!authUser) return null
  return getCurrentAppUser({
    authUserId: authUser.id,
    email: authUser.email,
    usernameHint: authUser.usernameHint,
  })
}

export async function POST(request: Request, { params }: Context) {
  const user = await getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { bundleId, fileId } = await params
  const oldFile = await getBundleFileForUser(bundleId, fileId, user.id)
  if (!oldFile) return NextResponse.json({ error: 'File not found' }, { status: 404 })

  const ipBurst = await limitUploadIpBurst(getClientIp(request.headers))
  if (!ipBurst.success) return rateLimitResponse(ipBurst, 'Upload rate limit reached')
  const accountDaily = await limitAccountUploads(user.id, user.tier)
  if (!accountDaily.success) return rateLimitResponse(accountDaily, 'Upload rate limit reached')

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File))
    return NextResponse.json({ error: 'No file was attached' }, { status: 400 })
  const validation = await validateFileContent(file)
  if (!validation.valid || !validation.mimeType)
    return NextResponse.json({ error: 'File validation failed' }, { status: 400 })

  const expiresAtInput = formData.get('expiresAt')
  let expiresAt: string | null = null
  if (typeof expiresAtInput === 'string' && expiresAtInput.trim()) {
    const parsed = new Date(expiresAtInput)
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Invalid expiration date' }, { status: 400 })
    }
    expiresAt = parsed.toISOString()
  }

  const replacementId = createFileIdSync()
  const { path, error: storageError } = await uploadBundleFileToStorage(
    bundleId,
    replacementId,
    file,
    validation.mimeType
  )
  if (storageError || !path)
    return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })

  try {
    const replacement = await replaceBundleFileInDatabase({
      oldFileId: fileId,
      bundleId,
      userId: user.id,
      filename: sanitizeFilename(file.name),
      fileType: getFileType(validation.mimeType),
      mimeType: validation.mimeType,
      size: file.size,
      storagePath: path,
      expiresAt,
    })
    if (!(await deleteFileFromStorage(oldFile.storage_path)))
      console.warn(
        `[ORPHAN] Old bundle file storage cleanup failed for file ${fileId} at path: ${oldFile.storage_path}`
      )
    return NextResponse.json({ success: true, file: replacement })
  } catch (error) {
    await deleteFileFromStorage(path)
    console.error('Bundle file replacement failed:', error)
    return NextResponse.json({ error: 'Could not replace bundle file' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Context) {
  const user = await getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { bundleId, fileId } = await params

  let body: { expiresAt?: unknown }
  try {
    body = (await request.json()) as { expiresAt?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  let expiresAt: string | null = null
  if (typeof body.expiresAt === 'string' && body.expiresAt.trim()) {
    const parsed = new Date(body.expiresAt)
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Invalid expiration date' }, { status: 400 })
    }
    expiresAt = parsed.toISOString()
  } else if (body.expiresAt !== null && body.expiresAt !== undefined) {
    return NextResponse.json({ error: 'Invalid expiration date' }, { status: 400 })
  }

  try {
    const file = await updateBundleFileExpirationForUser(bundleId, fileId, user.id, expiresAt)
    return NextResponse.json({ success: true, file })
  } catch {
    return NextResponse.json({ error: 'Could not update file expiration' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const user = await getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { bundleId, fileId } = await params
  try {
    const file = await getBundleFileForUser(bundleId, fileId, user.id)
    if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 })
    if (!(await deleteFileFromStorage(file.storage_path)))
      return NextResponse.json({ error: 'Could not delete file' }, { status: 500 })
    await deleteBundleFile(fileId, bundleId, user.id)
    if ((await countActiveBundleFiles(bundleId)) === 0) {
      await deleteBundleForUser(bundleId, user.id)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Bundle file delete failed:', error)
    return NextResponse.json({ error: 'Could not delete bundle file' }, { status: 500 })
  }
}
