import 'server-only';

import type { Metadata } from 'next';
import { getFileMetadata } from './server/database';

const BRAND_TITLE = 'Snaphost — Instant file sharing';

function withoutExtension(filename: string): string {
  const extensionStart = filename.lastIndexOf('.');
  return extensionStart > 0 ? filename.slice(0, extensionStart) : filename;
}

type FilePageMetadataOptions = {
  username?: string;
  isAnonymous?: boolean;
};

export async function getFilePageMetadata(
  slug: string,
  options: FilePageMetadataOptions = {}
): Promise<Metadata> {
  const { username, isAnonymous = false } = options;
  const file = await getFileMetadata(slug, username);

  if (!file) {
    return {
      title: {
        absolute: `${isAnonymous ? 'This snap link has expired' : 'Link not found'} | ${BRAND_TITLE}`,
      },
      description: isAnonymous
        ? 'This temporary snap link was available for 24 hours.'
        : 'This link may have expired or been deleted.',
    };
  }

  return {
    title: { absolute: `${withoutExtension(file.filename)} | ${BRAND_TITLE}` },
    description: `View ${file.filename} on Snaphost.`,
  };
}
