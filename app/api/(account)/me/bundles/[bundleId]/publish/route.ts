import { NextResponse } from 'next/server'
import { getCurrentAppUser } from '@/lib/server/auth-user'
import { getAuthUserFromRequest } from '@/lib/server/auth-server'
import {
  countActiveBundleFiles,
  getBundleForUser,
  isBundleSlugTaken,
  FreePlanLimitError,
  publishBundleForUserAtomic,
} from '@/lib/server/bundle-admin'
import { CONFIG } from '@/lib/config'
import { UPLOAD_ERRORS } from '@/lib/messages'
import { createFileIdSync } from '@/lib/generateFileId'

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
  if (bundle.status === 'published') return NextResponse.json({ success: true, bundle })
  if ((await countActiveBundleFiles(bundleId)) < 1)
    return NextResponse.json({ error: 'Upload at least one file first' }, { status: 422 })

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      let slug = createFileIdSync()
      while (await isBundleSlugTaken(slug, user.id)) slug = createFileIdSync()
      const published = await publishBundleForUserAtomic(
        bundleId,
        user.id,
        slug,
        CONFIG.MAX_ACTIVE_LINKS_FREE
      )
      return NextResponse.json({ success: true, bundle: published })
    } catch (error) {
      if (error instanceof FreePlanLimitError) {
        return NextResponse.json({ error: UPLOAD_ERRORS.freePlanLimitReached }, { status: 403 })
      }
      if (!String(error).includes('duplicate key')) throw error
    }
  }
  return NextResponse.json({ error: 'Could not generate a unique slug' }, { status: 500 })
}
