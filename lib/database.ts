import { supabase } from './supabase';
import { CONFIG } from './config';
import type { AdminFileRow, FileMetadata } from '@/types/app';

export type FileRecord = AdminFileRow;

/**
 * Fetch public file metadata by slug.
 */
export async function getFileMetadata(slug: string): Promise<FileMetadata | null> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
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

  const file = data as FileRecord;

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
export function getStoragePublicUrl(storagePath: string): string {
  return supabase.storage.from(CONFIG.STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}
