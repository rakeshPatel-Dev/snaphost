import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/server/supabase-admin';
import { CONFIG } from '@/lib/config';
import {
  countFilesForAnonSession,
  deleteAnonSession,
  deleteFileForAnonSession,
} from '@/lib/server/file-admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json({ error: 'Missing file id' }, { status: 400 });
    }

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

    const { data: fileRow, error: fileLookupError } = await supabaseAdmin
      .from('files')
      .select('id, storage_path')
      .eq('id', fileId)
      .eq('anon_session_id', session.id)
      .maybeSingle();

    if (fileLookupError) {
      throw fileLookupError;
    }

    if (!fileRow) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const { error: storageError } = await supabaseAdmin.storage
      .from(CONFIG.STORAGE_BUCKET)
      .remove([fileRow.storage_path]);

    if (storageError) {
      throw storageError;
    }

    const result = await deleteFileForAnonSession(fileId, session.id);

    const remaining = await countFilesForAnonSession(session.id);

    const response = NextResponse.json({ success: true, id: result.id }, { status: 200 });

    if (remaining === 0) {
      await deleteAnonSession(session.id);

      response.cookies.set({
        name: 'anon_session',
        value: '',
        httpOnly: true,
        secure: request.nextUrl.protocol === 'https:',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
    }

    return response;
  } catch (err) {
    console.error('anon delete error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
