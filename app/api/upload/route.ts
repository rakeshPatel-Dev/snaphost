import { NextRequest, NextResponse } from 'next/server';
import { validateFile, getFileType } from '@/lib/fileValidation';
import { sanitizeFilename } from '@/lib/sanitizeFilename';
import { createFileIdSync } from '@/lib/generateFileId';
import { uploadFileToStorage } from '@/lib/storage';
import { insertFileMetadata } from '@/lib/database';
import { CONFIG } from '@/lib/config';

export const maxDuration = 60; // 60 seconds for file upload

export async function POST(request: NextRequest) {
  try {
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
    const fileId = createFileIdSync();

    // Upload to storage
    const { path, error: storageError } = await uploadFileToStorage(fileId, file);

    if (storageError) {
      return NextResponse.json(
        { error: 'Failed to upload file', details: storageError },
        { status: 500 }
      );
    }

    // Insert metadata into database
    const fileRecord = await insertFileMetadata(
      fileId,
      sanitizedName,
      fileType as 'pdf' | 'image',
      file.size,
      path,
      file.type
    );

    if (!fileRecord) {
      return NextResponse.json(
        { error: 'Failed to save file metadata' },
        { status: 500 }
      );
    }

    // Return success with shareable URL
    const shareUrl = `${CONFIG.BASE_URL}/f/${fileId}`;

    return NextResponse.json(
      {
        success: true,
        fileId,
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
