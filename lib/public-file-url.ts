import type { UploadType } from '@/types/app'

type PublicFileUrlInput = {
  baseUrl: string
  slug: string
  username?: string | null
  uploadType: UploadType
}

export function buildPublicFileUrl({ baseUrl, slug, username, uploadType }: PublicFileUrlInput) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '') // Remove trailing slashes

  if (uploadType === 'anonymous') {
    return `${normalizedBaseUrl}/anon/${encodeURIComponent(slug)}`
  }

  const safeUsername = username || 'user'
  return `${normalizedBaseUrl}/${encodeURIComponent(safeUsername)}/${encodeURIComponent(slug)}`
}

export function buildPublicBundleUrl(baseUrl: string, username: string | null, slug: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')
  return `${normalizedBaseUrl}/${encodeURIComponent(username || 'user')}/${encodeURIComponent(slug)}`
}
