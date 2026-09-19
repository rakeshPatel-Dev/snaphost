import 'server-only';

import { supabaseAdmin } from './supabase-admin';
import { CONFIG } from '../config';
import type { AdminFileRow, FileType, UploadType } from '@/types/app';
import { buildPublicFileUrl } from '../public-file-url';

export async function createFileRecord(input: {
  userId: string | null;
  uploadType: UploadType;
  slug: string;
  filename: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  storagePath: string;
  expiresAt: string | null;
  anonSessionId?: string | null;
}) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .insert({
      user_id: input.userId,
      anon_session_id: input.anonSessionId ?? null,
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
  const { error, count } = await supabaseAdmin
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

export async function listFilesForAnonSession(anonSessionId: string) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .select('*, user:users(username)')
    .eq('anon_session_id', anonSessionId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminFileRow[];
}

export async function deleteFileForAnonSession(fileId: string, anonSessionId: string) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .delete()
    .eq('id', fileId)
    .eq('anon_session_id', anonSessionId)
    .select('id, storage_path')
    .single();

  if (error) {
    throw error;
  }

  return data as { id: string; storage_path: string };
}

export async function countFilesForAnonSession(anonSessionId: string) {
  const { count, error } = await supabaseAdmin
    .from('files')
    .select('id', { count: 'exact', head: true })
    .eq('anon_session_id', anonSessionId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function deleteAnonSession(anonSessionId: string) {
  const { data, error } = await supabaseAdmin
    .from('anon_sessions')
    .delete()
    .eq('id', anonSessionId)
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data as { id: string };
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
  return buildPublicFileUrl({
    baseUrl: CONFIG.BASE_URL,
    slug: file.slug,
    username,
    uploadType: file.upload_type,
  });
}
