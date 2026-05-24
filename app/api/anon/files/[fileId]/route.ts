import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { softDeleteFileForAnonSession } from '@/lib/file-admin';

export async function DELETE(request: NextRequest, { params }: { params: { fileId: string } }) {
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

    const fileId = params.fileId;

    const result = await softDeleteFileForAnonSession(fileId, session.id);

    return NextResponse.json({ success: true, id: result.id }, { status: 200 });
  } catch (err) {
    console.error('anon delete error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
