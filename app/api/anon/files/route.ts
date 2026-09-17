import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';
import { listFilesForAnonSession, buildFileUrl } from '@/lib/file-admin';
import { formatFileSize } from '@/shared/utils/file-format';
import type { AnonymousLink } from '@/types/app';

export async function GET(request: NextRequest) {
  try {
    const raw = request.cookies.get('anon_session')?.value ?? null;

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

    const payload: AnonymousLink[] = files.map((f) => ({
      id: f.id,
      filename: f.filename,
      fileType: f.file_type,
      fileSize: formatFileSize(Number(f.size)),
      url: buildFileUrl(f, null),
      createdAt: f.created_at,
      expiresAt: f.expires_at ?? new Date().toISOString(),
    }));

    return NextResponse.json({ files: payload }, { status: 200 });
  } catch (err) {
    console.error('anon list error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
