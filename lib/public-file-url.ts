import type { UploadType } from '@/types/app';

type PublicFileUrlInput = {
  baseUrl: string;
  slug: string;
  username?: string | null;
  uploadType: UploadType;
};

export function buildPublicFileUrl({ baseUrl, slug, username, uploadType }: PublicFileUrlInput) {
  if (uploadType === 'anonymous') {
    return `${baseUrl}/anon/${encodeURIComponent(slug)}`;
  }

  const safeUsername = username || 'user';
  return `${baseUrl}/${encodeURIComponent(safeUsername)}/${encodeURIComponent(slug)}`;
}