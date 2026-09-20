import { NextRequest, NextResponse } from 'next/server';
import { getFileMetadata } from '@/lib/server/database';

const SLUG_PATTERN = /^[a-zA-Z0-9_-]+$/;

export async function GET(request: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;

    if (!fileId || !SLUG_PATTERN.test(fileId)) {
      return NextResponse.json(
        { error: 'Invalid file ID' },
        { status: 400 }
      );
    }

    const username = request.nextUrl.searchParams.get('username');
    const metadata = await getFileMetadata(fileId, username);

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
