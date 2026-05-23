import { NextResponse } from 'next/server';
import { getFileMetadata } from '@/lib/database';
import { deleteFileBySlug, getFileBySlug } from '@/lib/file-admin';
import { deleteFileFromStorage } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    const metadata = await getFileMetadata(fileId);

    if (!metadata) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(metadata, { status: 200 });
  } catch (error) {
    console.error('File metadata route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // validate slug-ish id to avoid numeric-only queries
    if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
      return NextResponse.json({ error: 'Invalid file id' }, { status: 400 });
    }

    const file = await getFileBySlug(fileId);

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    if (file.upload_type !== 'anonymous') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const deletedFromStorage = await deleteFileFromStorage(file.storage_path);

    if (!deletedFromStorage) {
      return NextResponse.json(
        { error: 'Failed to delete file from storage' },
        { status: 500 }
      );
    }

    await deleteFileBySlug(fileId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('File delete route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
