import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';
import { listFilesForAnonSession } from '@/lib/file-admin';
import { buildFileUrl } from '@/lib/file-admin';

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/anon_session=([^;]+)/);
    const raw = match ? decodeURIComponent(match[1]) : null;

    if (!raw) {
      return NextResponse.json({ error: 'No anon session' }, { status: 401 });
    }

    const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');

    const { data: session } = await supabaseAdmin
      .from('anon_sessions')
      .select('id, expires_at, revoked_at')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (!session || session.revoked_at || new Date(session.expires_at) <= new Date()) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const files = await listFilesForAnonSession(session.id);

    const payload = files.map((f) => ({
      ...f,
      publicUrl: buildFileUrl(f, null),
    }));

    return NextResponse.json({ files: payload }, { status: 200 });
  } catch (err) {
    console.error('anon list error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
