import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCurrentAppUser } from '@/lib/clerk-user';
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
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getCurrentAppUser(userId);

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

  if (typeof body.expiresAt === 'string') {
    updates.expires_at = body.expiresAt || null;
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
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getCurrentAppUser(userId);

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
