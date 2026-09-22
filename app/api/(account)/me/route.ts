import { NextResponse } from 'next/server'
import { getCurrentAppUser, updateCurrentAppUserUsername } from '@/lib/server/auth-user'
import { getAuthUserFromRequest } from '@/lib/server/auth-server'

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

  return NextResponse.json({ user }, { status: 200 })
}

export async function PATCH(request: Request) {
  const authUser = await getAuthUserFromRequest(request)

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    const parsedBody: unknown = await request.json()
    if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 })
    }
    body = parsedBody as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : ''

  if (!/^[a-z0-9_-]{3,32}$/.test(username)) {
    return NextResponse.json(
      { error: 'Username must be 3–32 characters using letters, numbers, underscores, or hyphens' },
      { status: 400 }
    )
  }

  try {
    const { user } = await updateCurrentAppUserUsername(authUser.id, username)
    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    if ((error as { code?: string })?.code === '23505') {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update username' }, { status: 400 })
  }
}
