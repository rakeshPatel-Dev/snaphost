import 'server-only'

import crypto from 'crypto'

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
      cacheControl: '3600', // 1 hour cache
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

export async function uploadBundleFileToStorage(
  bundleId: string,
  fileId: string,
  file: File,
  mimeType: ValidatedMimeType
): Promise<{ path: string; error: string | null }> {
  const ext = STORAGE_EXTENSIONS[mimeType]
  const token = crypto.randomUUID().replace(/-/g, '')
  const storagePath = `uploads/${bundleId}/${fileId}/${token}${ext}`
  const bucket = supabase.storage.from(CONFIG.STORAGE_BUCKET)

  try {
    const { data, error } = await bucket.upload(storagePath, file, {
      cacheControl: '3600',
      contentType: mimeType,
      upsert: false,
    })

    if (error) {
      console.error('Bundle storage upload error:', error)
      return { path: '', error: error.message }
    }

    return { path: data.path, error: null }
  } catch (err) {
    console.error('Bundle storage upload exception:', err)
    return { path: '', error: err instanceof Error ? err.message : 'Upload failed' }
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
