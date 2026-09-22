import 'server-only'

import { supabase } from '../supabase'
import { supabaseAdmin } from './supabase-admin'
import { CONFIG } from '../config'
import type { ValidatedMimeType } from '../fileValidation'

const STORAGE_EXTENSIONS: Record<ValidatedMimeType, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFileToStorage(
  fileId: string,
  file: File,
  mimeType: ValidatedMimeType
): Promise<{ path: string; error: string | null }> {
  const bucket = supabase.storage.from(CONFIG.STORAGE_BUCKET)

  // Keep object metadata and extension tied to the verified binary type.
  const ext = STORAGE_EXTENSIONS[mimeType]
  const storagePath = `uploads/${fileId}${ext}`

  try {
    const { data, error } = await bucket.upload(storagePath, file, {
      cacheControl: '31536000', // 1 year cache
      contentType: mimeType,
      upsert: false,
    })

    if (error) {
      console.error('Storage upload error:', error)
      return { path: '', error: error.message }
    }

    return { path: data.path, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    console.error('Upload exception:', err)
    return { path: '', error: message }
  }
}

/**
 * Delete file from storage
 */
export async function deleteFileFromStorage(storagePath: string): Promise<boolean> {
  const bucket = supabaseAdmin.storage.from(CONFIG.STORAGE_BUCKET)

  try {
    const { error } = await bucket.remove([storagePath])
    return !error
  } catch (err) {
    console.error('Delete error:', err)
    return false
  }
}
