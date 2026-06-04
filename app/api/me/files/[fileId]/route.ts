import { NextResponse } from 'next/server';
import { getCurrentAppUser } from '@/lib/auth-user';
import { getAuthUserFromRequest } from '@/lib/auth-server';
import {
  buildFileUrl,
  deleteFileForUser,
  getFileForUser,
  updateFileForUser,
} from '@/lib/file-admin';
import { deleteFileFromStorage } from '@/lib/storage';

type RouteContext = {
  params: Promise<{ fileId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const authUser = await getAuthUserFromRequest(request);

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getCurrentAppUser({
    authUserId: authUser.id,
    email: authUser.email,
    usernameHint: authUser.usernameHint,
  });

  if (!user) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const { fileId } = await params;
  const body = await request.json();

  const updates: {
    slug?: string;
    filename?: string;
    expires_at?: string | null;
  } = {};

  if (typeof body.slug === 'string' && body.slug.trim()) {
    updates.slug = body.slug.trim().toLowerCase();
  }

  if (typeof body.filename === 'string' && body.filename.trim()) {
    updates.filename = body.filename.trim();
  }

  if (body.expiresAt === null) {
    updates.expires_at = null;
  } else if (typeof body.expiresAt === 'string') {
    const normalized = body.expiresAt.trim();
    updates.expires_at = normalized ? normalized : null;
  }

  const updated = await updateFileForUser(fileId, user.id, updates);

  return NextResponse.json(
    {
      file: {
        ...updated,
        publicUrl: buildFileUrl(updated, user.username),
      },
    },
    { status: 200 }
  );
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const authUser = await getAuthUserFromRequest(_request);

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getCurrentAppUser({
    authUserId: authUser.id,
    email: authUser.email,
    usernameHint: authUser.usernameHint,
  });

  if (!user) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const { fileId } = await params;
  const file = await getFileForUser(fileId, user.id);

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const storageDeleted = await deleteFileFromStorage(file.storage_path);

  if (!storageDeleted) {
    return NextResponse.json(
      { error: 'Failed to delete file from storage' },
      { status: 500 }
    );
  }

  await deleteFileForUser(fileId, user.id);

  return NextResponse.json({ success: true }, { status: 200 });
}
