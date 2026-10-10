import { NextResponse } from 'next/server'
import { getCurrentAppUser } from '@/lib/server/auth-user'
import { getAuthUserFromRequest } from '@/lib/server/auth-server'
import {
  deleteBundleForUser,
  getBundleStorageFilesForUser,
  getBundleForUser,
  isBundleSlugTaken,
  updateBundleMetadataForUser,
} from '@/lib/server/bundle-admin'
import { deleteFileFromStorage } from '@/lib/server/storage'

type Context = { params: Promise<{ bundleId: string }> }

async function getUser(request: Request) {
  const authUser = await getAuthUserFromRequest(request)
  if (!authUser) return null
  return getCurrentAppUser({
    authUserId: authUser.id,
    email: authUser.email,
    usernameHint: authUser.usernameHint,
  })
}

export async function PATCH(request: Request, { params }: Context) {
  const user = await getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { bundleId } = await params
  const current = await getBundleForUser(bundleId, user.id)
  if (!current) return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })

  let body: { name?: unknown; slug?: unknown }
  try {
    body = (await request.json()) as { name?: unknown; slug?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const updates: { name?: string; slug?: string } = {}
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 120)
      return NextResponse.json({ error: 'Invalid bundle name' }, { status: 400 })
    updates.name = body.name.trim()
  }
  if (body.slug !== undefined) {
    if (typeof body.slug !== 'string')
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    const slug = body.slug.trim().toLowerCase()
    if (!/^[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?$/.test(slug))
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    updates.slug = slug
  }
  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: 'No valid updates' }, { status: 400 })

  try {
    if (
      updates.slug &&
      updates.slug !== current.slug &&
      (await isBundleSlugTaken(updates.slug, user.id, bundleId))
    )
      return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
    const bundle = await updateBundleMetadataForUser(bundleId, user.id, updates)
    return NextResponse.json({ bundle })
  } catch (error) {
    const message = String(error).toLowerCase()
    if (message.includes('slug already taken') || message.includes('duplicate key')) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
    }
    if (message.includes('bundle not found'))
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    throw error
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const user = await getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { bundleId } = await params
  try {
    const files = await getBundleStorageFilesForUser(bundleId, user.id)
    for (const file of files) {
      if (!(await deleteFileFromStorage(file.storage_path)))
        return NextResponse.json({ error: 'Could not delete bundle files' }, { status: 500 })
    }
    await deleteBundleForUser(bundleId, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (String(error).includes('0 rows'))
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    throw error
  }
}
