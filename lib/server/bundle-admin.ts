import 'server-only'

import { supabaseAdmin } from './supabase-admin'
import { CONFIG } from '@/lib/config'
import { buildPublicBundleUrl } from '@/lib/public-file-url'
import type { AppBundle, AppBundleFile, BundleStatus } from '@/types/app'

type BundleRow = {
  id: string
  user_id: string
  slug: string | null
  name: string
  status: BundleStatus
  created_at: string
  updated_at: string
  published_at: string | null
  deleted_at: string | null
  user?: { username: string | null } | { username: string | null }[] | null
}

function usernameFromRow(row: BundleRow) {
  return Array.isArray(row.user) ? (row.user[0]?.username ?? null) : (row.user?.username ?? null)
}

function toBundle(
  row: BundleRow,
  fileCount = 0,
  totalSize = 0,
  files?: AppBundleFile[]
): AppBundle {
  const username = usernameFromRow(row)
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    published_at: row.published_at,
    fileCount,
    totalSize,
    files,
    publicUrl:
      row.status === 'published' && row.slug
        ? buildPublicBundleUrl(CONFIG.BASE_URL, username, row.slug)
        : null,
  }
}

export async function createBundleForUser(userId: string, name?: string) {
  const { data, error } = await supabaseAdmin
    .from('bundles')
    .insert({ user_id: userId, name: name?.trim() || 'Untitled bundle', status: 'draft' })
    .select('*, user:users(username)')
    .single()

  if (error) throw error
  return toBundle(data as BundleRow)
}

export async function getBundleForUser(bundleId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('bundles')
    .select('*, user:users(username)')
    .eq('id', bundleId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) throw error
  return data ? (data as BundleRow) : null
}

export async function listBundlesForUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('bundles')
    .select(
      '*, user:users(username), files!inner(id, filename, file_type, mime_type, size, expires_at, created_at, storage_path, deleted_at)'
    )
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const bundle = row as BundleRow & {
      files?: Array<AppBundleFile & { deleted_at: string | null }>
    }
    const activeFiles = (bundle.files ?? []).filter(
      (file) => !file.deleted_at && (!file.expires_at || new Date(file.expires_at) > new Date())
    )
    return toBundle(
      bundle,
      activeFiles.length,
      activeFiles.reduce((total, file) => total + Number(file.size), 0),
      activeFiles.map((file) => ({
        id: file.id,
        filename: file.filename,
        file_type: file.file_type,
        mime_type: file.mime_type,
        size: file.size,
        expires_at: file.expires_at,
        created_at: file.created_at,
      }))
    )
  })
}

export async function countBundlesForUser(userId: string) {
  const { count, error } = await supabaseAdmin
    .from('bundles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (error) throw error
  return count ?? 0
}

export async function countPublishedBundlesForUser(userId: string) {
  const { count, error } = await supabaseAdmin
    .from('bundles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'published')
    .is('deleted_at', null)

  if (error) throw error
  return count ?? 0
}

export async function countBundleFiles(bundleId: string) {
  const { count, error } = await supabaseAdmin
    .from('files')
    .select('id', { count: 'exact', head: true })
    .eq('bundle_id', bundleId)
    .is('deleted_at', null)

  if (error) throw error
  return count ?? 0
}

export async function countActiveBundleFiles(bundleId: string) {
  const { count, error } = await supabaseAdmin
    .from('files')
    .select('id', { count: 'exact', head: true })
    .eq('bundle_id', bundleId)
    .is('deleted_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

  if (error) throw error
  return count ?? 0
}

export async function isBundleSlugTaken(slug: string, userId: string, excludeBundleId?: string) {
  let currentQuery = supabaseAdmin
    .from('bundles')
    .select('id')
    .eq('slug', slug)
    .is('deleted_at', null)
    .limit(1)
  if (excludeBundleId) currentQuery = currentQuery.neq('id', excludeBundleId)
  const { data: current, error: currentError } = await currentQuery
  if (currentError) throw currentError
  if (current && current.length > 0) return true

  const { data: files, error: filesError } = await supabaseAdmin
    .from('files')
    .select('id')
    .eq('slug', slug)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .limit(1)
  if (filesError) throw filesError
  if (files && files.length > 0) return true

  const { data: history, error: historyError } = await supabaseAdmin
    .from('bundle_slug_history')
    .select('bundle_id')
    .eq('slug', slug)
    .limit(1)
  if (historyError) throw historyError
  return Boolean(history && history.length > 0)
}

export async function updateBundleFileExpirationForUser(
  bundleId: string,
  fileId: string,
  userId: string,
  expiresAt: string | null
) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .update({ expires_at: expiresAt })
    .eq('id', fileId)
    .eq('bundle_id', bundleId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .select('id, filename, file_type, mime_type, size, expires_at, created_at')
    .single()

  if (error) throw error
  return data as AppBundleFile
}

export async function updateBundleForUser(
  bundleId: string,
  userId: string,
  updates: { name?: string; slug?: string }
) {
  const { data, error } = await supabaseAdmin
    .from('bundles')
    .update(updates)
    .eq('id', bundleId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .select('*, user:users(username)')
    .single()

  if (error) throw error
  return toBundle(data as BundleRow)
}

export async function updateBundleMetadataForUser(
  bundleId: string,
  userId: string,
  updates: { name?: string; slug?: string }
) {
  const { data, error } = await supabaseAdmin
    .rpc('update_bundle_metadata', {
      p_bundle_id: bundleId,
      p_user_id: userId,
      p_name: updates.name ?? null,
      p_new_slug: updates.slug ?? null,
    })
    .single()

  if (error) throw error
  return toBundle(data as BundleRow)
}

export async function publishBundleForUser(bundleId: string, userId: string, slug: string) {
  const { data, error } = await supabaseAdmin
    .from('bundles')
    .update({ slug, status: 'published', published_at: new Date().toISOString() })
    .eq('id', bundleId)
    .eq('user_id', userId)
    .eq('status', 'draft')
    .is('deleted_at', null)
    .select('*, user:users(username)')
    .single()

  if (error) throw error
  return toBundle(data as BundleRow)
}

export class FreePlanLimitError extends Error {
  constructor() {
    super('free plan link limit reached')
    this.name = 'FreePlanLimitError'
  }
}

export async function publishBundleForUserAtomic(
  bundleId: string,
  userId: string,
  slug: string,
  maxLinks: number
) {
  const { data, error } = await supabaseAdmin
    .rpc('publish_bundle_for_user', {
      p_bundle_id: bundleId,
      p_user_id: userId,
      p_slug: slug,
      p_max_links: maxLinks,
    })
    .single()

  if (error) {
    const msg = String((error as unknown as Record<string, unknown>).message ?? error)
    if (msg.includes('free plan link limit reached')) throw new FreePlanLimitError()
    throw error
  }
  return toBundle(data as BundleRow)
}

export async function addBundleSlugHistory(bundleId: string, slug: string) {
  const { error } = await supabaseAdmin
    .from('bundle_slug_history')
    .upsert({ bundle_id: bundleId, slug }, { onConflict: 'slug', ignoreDuplicates: true })
  if (error) throw error
}

export async function deleteBundleForUser(bundleId: string, userId: string) {
  const { error } = await supabaseAdmin
    .from('bundles')
    .delete()
    .eq('id', bundleId)
    .eq('user_id', userId)
    .select('id')
    .single()

  if (error) throw error
}

export async function getBundleStorageFilesForUser(bundleId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .select('id, storage_path')
    .eq('bundle_id', bundleId)
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (error) throw error
  return (data ?? []) as Array<{ id: string; storage_path: string }>
}

export async function getPublicBundle(slug: string, username?: string) {
  const { data, error } = await supabaseAdmin
    .from('bundles')
    .select(
      '*, user:users(username), files(id, filename, file_type, mime_type, size, expires_at, created_at, storage_path, deleted_at)'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  if (username && usernameFromRow(data as BundleRow) !== username) return null

  const row = data as BundleRow & {
    files?: Array<AppBundleFile & { storage_path: string; deleted_at: string | null }>
  }
  const files = (row.files ?? [])
    .filter(
      (file) => !file.deleted_at && (!file.expires_at || new Date(file.expires_at) > new Date())
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  if (files.length === 0) return null

  return {
    ...toBundle(
      row,
      files.length,
      files.reduce((total, file) => total + Number(file.size), 0)
    ),
    files: files.map((file) => ({
      id: file.id,
      filename: file.filename,
      file_type: file.file_type,
      mime_type: file.mime_type,
      size: file.size,
      expires_at: file.expires_at,
      created_at: file.created_at,
      url: supabaseAdmin.storage.from(CONFIG.STORAGE_BUCKET).getPublicUrl(file.storage_path).data
        .publicUrl,
      downloadUrl: supabaseAdmin.storage
        .from(CONFIG.STORAGE_BUCKET)
        .getPublicUrl(file.storage_path, { download: file.filename }).data.publicUrl,
    })),
  }
}

export async function getBundleForHistoricalSlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('bundle_slug_history')
    .select('bundle:bundles(slug, user:users(username), status, deleted_at)')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  const bundle = data?.bundle as unknown as {
    slug: string | null
    status: BundleStatus
    deleted_at: string | null
    user?: { username: string | null } | { username: string | null }[] | null
  } | null
  if (!bundle || bundle.status !== 'published' || bundle.deleted_at || !bundle.slug) return null
  return {
    slug: bundle.slug,
    username: Array.isArray(bundle.user) ? bundle.user[0]?.username : bundle.user?.username,
  }
}

export async function getBundleFileForUser(bundleId: string, fileId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .select('*')
    .eq('id', fileId)
    .eq('bundle_id', bundleId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function insertBundleFile(input: {
  bundleId: string
  userId: string
  filename: string
  fileType: 'image' | 'pdf'
  mimeType: string
  size: number
  storagePath: string
  expiresAt: string | null
}) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .insert({
      user_id: input.userId,
      upload_type: 'custom',
      bundle_id: input.bundleId,
      slug: null,
      filename: input.filename,
      file_type: input.fileType,
      mime_type: input.mimeType,
      size: input.size,
      storage_path: input.storagePath,
      expires_at: input.expiresAt,
      deleted_at: null,
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function replaceBundleFileInDatabase(input: {
  oldFileId: string
  bundleId: string
  userId: string
  filename: string
  fileType: 'image' | 'pdf'
  mimeType: string
  size: number
  storagePath: string
  expiresAt: string | null
}) {
  const { data, error } = await supabaseAdmin
    .rpc('replace_bundle_file', {
      p_old_file_id: input.oldFileId,
      p_bundle_id: input.bundleId,
      p_user_id: input.userId,
      p_filename: input.filename,
      p_file_type: input.fileType,
      p_mime_type: input.mimeType,
      p_size: input.size,
      p_storage_path: input.storagePath,
      p_expires_at: input.expiresAt,
    })
    .single()

  if (error) throw error
  return data
}

export async function deleteBundleFile(fileId: string, bundleId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('files')
    .delete()
    .eq('id', fileId)
    .eq('bundle_id', bundleId)
    .eq('user_id', userId)
    .select('id, storage_path')
    .single()

  if (error) throw error
  return data as { id: string; storage_path: string }
}
