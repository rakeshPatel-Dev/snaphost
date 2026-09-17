import { supabase } from './supabase';
import { supabaseAdmin } from './supabase-admin';
import { CONFIG } from './config';
import { getFileExtension } from './sanitizeFilename';

/**
 * Upload file to Supabase Storage
 */
export async function uploadFileToStorage(
  fileId: string,
  file: File
): Promise<{ path: string; error: string | null }> {
  const bucket = supabase.storage.from(CONFIG.STORAGE_BUCKET);

  // Store in format: uploads/{fileId}.{extension}
  const ext = getFileExtension(file.name).toLowerCase();
  const storagePath = `uploads/${fileId}${ext}`;

  try {
    const { data, error } = await bucket.upload(storagePath, file, {
      cacheControl: '31536000', // 1 year cache
      upsert: false,
    });

    if (error) {
      console.error('Storage upload error:', error);
      return { path: '', error: error.message };
    }

    return { path: data.path, error: null };
  } catch (err: any) {
    console.error('Upload exception:', err);
    return { path: '', error: err.message || 'Upload failed' };
  }
}

/**
 * Delete file from storage
 */
export async function deleteFileFromStorage(storagePath: string): Promise<boolean> {
  const bucket = supabaseAdmin.storage.from(CONFIG.STORAGE_BUCKET);

  try {
    const { error } = await bucket.remove([storagePath]);
    return !error;
  } catch (err) {
    console.error('Delete error:', err);
    return false;
  }
}

