import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCurrentAppUser, updateCurrentAppUserUsername } from '@/lib/clerk-user';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getCurrentAppUser(userId);

  return NextResponse.json({ user }, { status: 200 });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';

  if (!username || username.length < 3) {
    return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
  }

  try {
    const { user } = await updateCurrentAppUserUsername(userId, username);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update username' },
      { status: 400 }
    );
  }
}
