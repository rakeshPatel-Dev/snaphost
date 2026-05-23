import { NextRequest, NextResponse } from 'next/server';
import { validateFile, getFileType } from '@/lib/fileValidation';
import { sanitizeFilename } from '@/lib/sanitizeFilename';
import { createFileIdSync } from '@/lib/generateFileId';
import { uploadFileToStorage } from '@/lib/storage';
import { auth } from '@clerk/nextjs/server';
import { createFileRecord, buildFileUrl } from '@/lib/file-admin';
import { getCurrentAppUser } from '@/lib/clerk-user';

export const maxDuration = 60; // 60 seconds for file upload

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'File validation failed',
          details: validation.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedName = sanitizeFilename(file.name);
    const fileType = getFileType(file.type);

    if (fileType === 'unknown') {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Generate unique file ID
    const slug = createFileIdSync();
    const expiresAtInput = formData.get('expiresAt');

    let userRecord = null;
    if (userId) {
      userRecord = await getCurrentAppUser(userId);
    }

    const uploadType = userId ? 'custom' : 'anonymous';
    const expiresAt =
      uploadType === 'anonymous'
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : typeof expiresAtInput === 'string' && expiresAtInput.trim()
          ? new Date(expiresAtInput).toISOString()
          : null;

    // Upload to storage
    const { path, error: storageError } = await uploadFileToStorage(slug, file);

    if (storageError) {
      return NextResponse.json(
        { error: 'Failed to upload file', details: storageError },
        { status: 500 }
      );
    }

    // Insert metadata into database
    const fileRecord = await createFileRecord({
      userId: userRecord?.id ?? null,
      uploadType,
      slug,
      filename: sanitizedName,
      fileType: fileType as 'pdf' | 'image',
      mimeType: file.type,
      size: file.size,
      storagePath: path,
      expiresAt,
    });

    // Return success with shareable URL
    const shareUrl = buildFileUrl(fileRecord, userRecord?.username);

    return NextResponse.json(
      {
        success: true,
        fileId: slug,
        filename: sanitizedName,
        url: shareUrl,

      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
