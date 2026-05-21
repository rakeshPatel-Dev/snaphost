import { supabase } from './supabase';
import { CONFIG } from './config';

export interface FileRecord {
  id: string;
  file_id: string;
  filename: string;
  file_type: 'pdf' | 'image';
  size: number;
  storage_path: string;
  created_at: string;
  mime_type?: string;
}

export interface FileMetadata {
  fileId: string;
  filename: string;
  fileType: 'pdf' | 'image';
  size: number;
  createdAt: string;
  url: string;
}

/**
 * Insert file metadata into database
 */
export async function insertFileMetadata(
  fileId: string,
  filename: string,
  fileType: 'pdf' | 'image',
  size: number,
  storagePath: string,
  mimeType: string
): Promise<FileRecord | null> {
  const { data, error } = await supabase
    .from('files')
    .insert({
      file_id: fileId,
      filename,
      file_type: fileType,
      size,
      storage_path: storagePath,
      mime_type: mimeType,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting file metadata:', error);
    return null;
  }

  return data as FileRecord;
}

/**
 * Fetch file metadata by file_id
 */
export async function getFileMetadata(fileId: string): Promise<FileMetadata | null> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('file_id', fileId)
    .single();

  if (error) {
    console.error('Error fetching file metadata:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  const file = data as FileRecord;
  const url = getPublicFileUrl(file.storage_path);

  return {
    fileId: file.file_id,
    filename: file.filename,
    fileType: file.file_type,
    size: file.size,
    createdAt: file.created_at,
    url,
  };
}

/**
 * Generate public file URL from storage path
 */
export function getPublicFileUrl(storagePath: string): string {
  return `${supabase.storage.from(CONFIG.STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl}`;
}
