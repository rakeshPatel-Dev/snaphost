import { NextResponse } from 'next/server'
import { getCurrentAppUser } from '@/lib/server/auth-user'
import { getAuthUserFromRequest } from '@/lib/server/auth-server'
import { getAccountUploadQuota } from '@/lib/server/upload-rate-limit'

export async function GET(request: Request) {
  const authUser = await getAuthUserFromRequest(request)

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getCurrentAppUser({
    authUserId: authUser.id,
    email: authUser.email,
    usernameHint: authUser.usernameHint,
  })

  if (!user) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const quota = await getAccountUploadQuota(user.id, user.tier)

  if (!quota) {
    return NextResponse.json({ remaining: null, limit: null, reset: null }, { status: 200 })
  }

  return NextResponse.json(quota, { status: 200 })
}
