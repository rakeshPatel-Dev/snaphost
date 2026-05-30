import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_\-]{1,30}[a-z0-9])?$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get('username') ?? '';
  const username = rawUsername.trim().toLowerCase();

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  if (username.length < 3 || username.length > 32 || !USERNAME_PATTERN.test(username)) {
    return NextResponse.json(
      {
        username,
        available: false,
        exists: false,
        valid: false,
        message:
          'Use 3-32 lowercase letters, numbers, underscores, or hyphens.',
      },
      { status: 200 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Failed to check username' }, { status: 500 });
  }

  const exists = Boolean(data);

  return NextResponse.json(
    {
      username,
      available: !exists,
      exists,
      valid: true,
    },
    { status: 200 }
  );
}
