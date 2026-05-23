import { supabaseAdmin } from './supabase-admin';
import { CONFIG } from './config';

export type AdminFileRow = {
  id: string;
  user_id: string | null;
  upload_type: 'anonymous' | 'custom';
  slug: string;
  filename: string;
  file_type: 'pdf' | 'image';
  mime_type: string;
  size: number;
  storage_path: string;
  expires_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  user?: { username: string | null } | null;
};

export async function createFileRecord(input: {
  userId: string | null;
  uploadType: 'anonymous' | 'custom';
  slug: string;
  filename: string;
  fileType: 'pdf' | 'image';
  mimeType: string;
  size: number;
  storagePath: string;
  expiresAt: string | null;
}) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .insert({
      user_id: input.userId,
      upload_type: input.uploadType,
      slug: input.slug,
      filename: input.filename,
      file_type: input.fileType,
      mime_type: input.mimeType,
      size: input.size,
      storage_path: input.storagePath,
      expires_at: input.expiresAt,
      deleted_at: null,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as AdminFileRow;
}

export async function listFilesForUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .select('*, user:users(username)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminFileRow[];
}

export async function countActiveFilesForUser(userId: string) {
  const { data, error, count } = await supabaseAdmin
    .from('files')
    .select('id', { count: 'exact', head: false })
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (error) {
    throw error;
  }

  return (count ?? 0) as number;
}

export async function getFileForUser(fileId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .select('*, user:users(username)')
    .eq('id', fileId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as AdminFileRow | null;
}

export async function getFileById(fileId: string) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .select('*, user:users(username)')
    .eq('id', fileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as AdminFileRow | null;
}

export async function getFileBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .select('*, user:users(username)')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as AdminFileRow | null;
}

export async function deleteFileById(fileId: string) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .delete()
    .eq('id', fileId)
    .select('id, storage_path, upload_type')
    .single();

  if (error) {
    throw error;
  }

  return data as { id: string; storage_path: string; upload_type: 'anonymous' | 'custom' };
}

export async function deleteFileBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .delete()
    .eq('slug', slug)
    .select('id, storage_path, upload_type')
    .single();

  if (error) {
    throw error;
  }

  return data as { id: string; storage_path: string; upload_type: 'anonymous' | 'custom' };
}

export async function updateFileForUser(
  fileId: string,
  userId: string,
  updates: Partial<Pick<AdminFileRow, 'slug' | 'filename' | 'expires_at'>>
) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .update(updates)
    .eq('id', fileId)
    .eq('user_id', userId)
    .select('*, user:users(username)')
    .single();

  if (error) {
    throw error;
  }

  return data as AdminFileRow;
}

export async function softDeleteFileForUser(fileId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', fileId)
    .eq('user_id', userId)
    .select('id, storage_path')
    .single();

  if (error) {
    throw error;
  }

  return data as { id: string; storage_path: string };
}

export async function deleteFileForUser(fileId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .delete()
    .eq('id', fileId)
    .eq('user_id', userId)
    .select('id, storage_path')
    .single();

  if (error) {
    throw error;
  }

  return data as { id: string; storage_path: string };
}

export function buildFileUrl(file: AdminFileRow, username?: string | null) {
  if (file.upload_type === 'anonymous' || !file.user_id) {
    return `${CONFIG.BASE_URL}/anon/${file.slug}`;
  }

  const safeUsername = username || 'user';
  return `${CONFIG.BASE_URL}/${encodeURIComponent(safeUsername)}/${encodeURIComponent(file.slug)}`;
}
