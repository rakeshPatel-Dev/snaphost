import 'server-only';

import { supabaseAdmin } from './supabase-admin';
import { CONFIG } from '../config';
import type { AdminFileRow, FileMetadata } from '@/types/app';

type FileRecord = AdminFileRow;

/**
 * Fetch public file metadata. Slugs are only unique per owner:
 *  - custom files are resolved by (username, slug), since the username is
 *    globally unique;
 *  - slug-only lookups (anonymous / short links) are scoped to ownerless rows
 *    so they can never collide with a custom file that happens to share a slug.
 */
export async function getFileMetadata(
  slug: string,
  username?: string | null
): Promise<FileMetadata | null> {
  if (!slug) {
    return null;
  }

  // Share metadata is intentionally fetched server-side. The browser must not
  // receive direct SELECT access to files because rows include ownership and
  // storage internals.
  let query = supabaseAdmin
    .from('files')
    .select('slug, filename, file_type, size, created_at, expires_at, storage_path, user:users(username)')
    .eq('slug', slug)
    .is('deleted_at', null)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

  if (username) {
    query = query.eq('upload_type', 'custom');
  } else {
    query = query.is('user_id', null);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Unexpected error fetching file metadata:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  // PostgREST embed filters do not exclude the parent row, so enforce the
  // composite (username, slug) key here: a custom file must belong to the
  // username in the URL, otherwise treat it as not found.
  const file = data as unknown as Pick<
    FileRecord,
    'slug' | 'filename' | 'file_type' | 'size' | 'created_at' | 'expires_at' | 'storage_path'
  > & { user?: { username: string | null }[] | { username: string | null } | null };

  if (username) {
    const ownerName = Array.isArray(file.user) ? file.user[0]?.username : file.user?.username;
    if (ownerName !== username) {
      return null;
    }
  }

  return {
    slug: file.slug,
    filename: file.filename,
    fileType: file.file_type,
    size: file.size,
    createdAt: file.created_at,
    expiresAt: file.expires_at,
    url: getStoragePublicUrl(file.storage_path),
    downloadUrl: getStorageDownloadUrl(file.storage_path, file.filename),
  };
}

/**
 * Generate the storage URL used for previews.
 */
function getStoragePublicUrl(storagePath: string): string {
  return supabaseAdmin.storage.from(CONFIG.STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

/**
 * Generate a download URL that keeps the safe, user-facing filename.
 * The storage object itself retains its random path.
 */
function getStorageDownloadUrl(storagePath: string, filename: string): string {
  return supabaseAdmin.storage
    .from(CONFIG.STORAGE_BUCKET)
    .getPublicUrl(storagePath, { download: filename }).data.publicUrl;
}
