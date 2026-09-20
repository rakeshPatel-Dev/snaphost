import 'server-only';

import { supabaseAdmin } from './supabase-admin';
import { CONFIG } from '../config';
import type { AdminFileRow, FileMetadata } from '@/types/app';

type FileRecord = AdminFileRow;

/**
 * Fetch public file metadata by slug.
 */
export async function getFileMetadata(slug: string): Promise<FileMetadata | null> {
  // Share metadata is intentionally fetched server-side. The browser must not
  // receive direct SELECT access to files because rows include ownership and
  // storage internals.
  const { data, error } = await supabaseAdmin
    .from('files')
    .select('slug, filename, file_type, size, created_at, expires_at, storage_path')
    .eq('slug', slug)
    .is('deleted_at', null)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
    .single();

  if (error) {
    console.error('Error fetching file metadata:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  const file = data as Pick<
    FileRecord,
    'slug' | 'filename' | 'file_type' | 'size' | 'created_at' | 'expires_at' | 'storage_path'
  >;

  return {
    slug: file.slug,
    filename: file.filename,
    fileType: file.file_type,
    size: file.size,
    createdAt: file.created_at,
    expiresAt: file.expires_at,
    url: getStoragePublicUrl(file.storage_path),
  };
}

/**
 * Generate the storage URL used for previews.
 */
function getStoragePublicUrl(storagePath: string): string {
  return supabaseAdmin.storage.from(CONFIG.STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}
