import { NextResponse } from 'next/server'
import { getCurrentAppUser } from '@/lib/server/auth-user'
import { getAuthUserFromRequest } from '@/lib/server/auth-server'
import { listFilesForUser, buildFileUrl } from '@/lib/server/file-admin'

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

  const files = await listFilesForUser(user.id)

  return NextResponse.json(
    {
      files: files.map((file) => ({
        ...file,
        publicUrl: buildFileUrl(file, user.username),
      })),
    },
    { status: 200 }
  )
}
