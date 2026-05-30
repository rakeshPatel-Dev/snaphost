import { NextResponse } from 'next/server';
import { getCurrentAppUser, updateCurrentAppUserUsername } from '@/lib/auth-user';
import { getAuthUserFromRequest } from '@/lib/auth-server';

export async function GET(request: Request) {
  const authUser = await getAuthUserFromRequest(request);

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getCurrentAppUser({
    authUserId: authUser.id,
    email: authUser.email,
    usernameHint: authUser.usernameHint,
  });

  return NextResponse.json({ user }, { status: 200 });
}

export async function PATCH(request: Request) {
  const authUser = await getAuthUserFromRequest(request);

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';

  if (!username || username.length < 3) {
    return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
  }

  try {
    const { user } = await updateCurrentAppUserUsername(authUser.id, username);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update username' },
      { status: 400 }
    );
  }
}
