import 'server-only'

import type { Metadata } from 'next'
import { getFileMetadata } from './server/database'
import { getPublicBundle } from './server/bundle-admin'
import {
  absoluteUrl,
  NO_INDEX,
  OG_IMAGE_ALT,
  OG_IMAGE_PATH,
  OG_IMAGE_SIZE,
  SITE_LOCALE,
  SITE_NAME,
} from './seo'

const BRAND_TITLE = 'Snaphost — Instant file sharing'

function withoutExtension(filename: string): string {
  const extensionStart = filename.lastIndexOf('.')
  return extensionStart > 0 ? filename.slice(0, extensionStart) : filename
}

function humanFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return 'Unknown size'
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`
}

const FILE_TYPE_LABEL = {
  image: 'Image',
  pdf: 'PDF document',
} as const

type FilePageMetadataOptions = {
  username?: string
  isAnonymous?: boolean
  canonicalPath?: string
}

export async function getFilePageMetadata(
  slug: string,
  options: FilePageMetadataOptions = {}
): Promise<Metadata> {
  const { username, isAnonymous = false, canonicalPath } = options
  const canonical = canonicalPath ?? `/f/${slug}`
  const bundle = !isAnonymous ? await getPublicBundle(slug, username) : null

  if (bundle) {
    const title = `${bundle.name} | ${BRAND_TITLE}`
    const description = `View ${bundle.fileCount} shared file${bundle.fileCount === 1 ? '' : 's'} in this bundle on ${SITE_NAME}.`
    const previewImage = bundle.files.find((file) => file.file_type === 'image')?.url
    const socialImageUrl = previewImage ?? absoluteUrl(OG_IMAGE_PATH)
    const socialImageAlt = previewImage ? `${bundle.name} shared on ${SITE_NAME}` : OG_IMAGE_ALT

    return {
      title: { absolute: title },
      description,
      alternates: { canonical },
      applicationName: SITE_NAME,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      },
      openGraph: {
        title,
        description,
        url: absoluteUrl(canonical),
        siteName: SITE_NAME,
        type: 'website',
        locale: SITE_LOCALE,
        images: [
          {
            url: socialImageUrl,
            width: OG_IMAGE_SIZE.width,
            height: OG_IMAGE_SIZE.height,
            alt: socialImageAlt,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [{ url: socialImageUrl, alt: socialImageAlt }],
      },
    }
  }

  const file = await getFileMetadata(slug, username)

  if (!file) {
    const title = isAnonymous ? 'This snap link has expired' : 'Link not found'
    const description = isAnonymous
      ? 'This temporary snap link was available for 24 hours and is no longer active.'
      : 'This link may have expired, been deleted, or the address may be incorrect.'

    return {
      title: { absolute: `${title} | ${BRAND_TITLE}` },
      description,
      alternates: { canonical },
      robots: NO_INDEX,
      openGraph: {
        title: `${title} | ${BRAND_TITLE}`,
        description,
        url: absoluteUrl(canonical),
        siteName: SITE_NAME,
        type: 'website',
        locale: SITE_LOCALE,
        images: [
          {
            url: absoluteUrl(OG_IMAGE_PATH),
            width: OG_IMAGE_SIZE.width,
            height: OG_IMAGE_SIZE.height,
            alt: OG_IMAGE_ALT,
          },
        ],
      },
      twitter: {
        card: 'summary',
        title: `${title} | ${BRAND_TITLE}`,
        description,
      },
    }
  }

  const name = withoutExtension(file.filename)
  const title = `${name} | ${BRAND_TITLE}`
  const typeLabel = FILE_TYPE_LABEL[file.fileType] ?? 'File'
  const sizeLabel = humanFileSize(file.size)
  const description = `View this ${typeLabel.toLowerCase()} (${file.filename}, ${sizeLabel}) shared on ${SITE_NAME}.`
  const imageAlt = `${file.filename} shared on ${SITE_NAME}`
  const hasPreviewImage = file.fileType === 'image' && Boolean(file.url)
  const socialImageUrl = hasPreviewImage ? (file.url as string) : absoluteUrl(OG_IMAGE_PATH)
  const socialImageAlt = hasPreviewImage ? imageAlt : OG_IMAGE_ALT

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    applicationName: SITE_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
        noimageindex: !hasPreviewImage,
      },
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonical),
      siteName: SITE_NAME,
      type: 'article',
      locale: SITE_LOCALE,
      images: [
        {
          url: socialImageUrl,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt: socialImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: socialImageUrl, alt: socialImageAlt }],
    },
  }
}
