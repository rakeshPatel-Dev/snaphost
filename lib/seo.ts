import type { Metadata } from 'next'
import { DOMAIN, EMAILS, SITE_URL } from '@/data/emails'
import type { FAQItem } from '@/data/faq'

export const SITE_NAME = 'SnapHost'
export const SITE_LOCALE = 'en_US'
export const SITE_LANG = 'en-US'

export const DEFAULT_TITLE = 'SnapHost — Instant File Sharing for Images & PDFs'
export const DEFAULT_DESCRIPTION =
  'Upload images and PDFs and get a clean, shareable link in seconds. No account needed, anonymous links expire after 24 hours, and signed-in users get custom URLs and per-file expiry control.'

export const DEFAULT_KEYWORDS = [
  'file hosting',
  'file sharing',
  'image upload',
  'image hosting',
  'pdf sharing',
  'pdf host',
  'instant file share',
  'anonymous file upload',
  'temporary file hosting',
  'free image host',
  'share files online',
  'no signup file sharing',
  'expire link',
  'custom url upload',
]

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const
export const OG_IMAGE_PATH = '/opengraph-image'
export const OG_IMAGE_ALT = 'SnapHost — instant file sharing for images and PDFs'

export const MAX_FILE_SIZE_LABEL = '10 MB'
export const SUPPORTED_FORMATS = 'PNG, JPG, WEBP, PDF'

export const PRO_FEATURE_KEYWORDS = [
  'unlimited file sharing',
  'premium file host',
  'password protected file link',
  'custom expiry links',
  'custom url file hosting',
  '50 mb file upload',
  'priority file hosting',
  'file sharing pro',
  'large file share link',
]

export const LEGAL_PAGE_KEYWORDS = ['privacy policy', 'terms of service', 'data policy', 'legal']

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path
  return new URL(path, SITE_URL).toString()
}

type JsonLd = Record<string, unknown>

export function organizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/icon1.png'),
      width: 96,
      height: 96,
      caption: SITE_NAME,
    },
    image: absoluteUrl(OG_IMAGE_PATH),
    description: DEFAULT_DESCRIPTION,
    slogan: 'Upload. Get a link. Share.',
    email: EMAILS.support,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: EMAILS.support,
        availableLanguage: ['English'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'billing',
        email: EMAILS.billing,
        availableLanguage: ['English'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'security',
        email: EMAILS.security,
        availableLanguage: ['English'],
      },
    ],
  }
}

export function websiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: DOMAIN,
    inLanguage: SITE_LANG,
    publisher: { '@id': `${SITE_URL}/#organization` },
    description: DEFAULT_DESCRIPTION,
  }
}

export function softwareApplicationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#app`,
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'File sharing',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    description:
      'Upload images and PDFs and get a shareable link in seconds. Works with or without an account.',
    inLanguage: SITE_LANG,
    publisher: { '@id': `${SITE_URL}/#organization` },
    featureList: [
      'Instant image and PDF uploads',
      'Shareable public links',
      'Anonymous uploads that expire after 24 hours',
      'Custom username-based URLs',
      'Per-file expiry control',
      'Password-protected links (Pro)',
      'File management dashboard',
      'Delete uploads anytime',
    ],
    offers: {
      '@type': 'Offer',
      '@id': `${SITE_URL}/#free-plan`,
      name: 'Free',
      description: 'Upload up to 3 active links, 10 MB per file, auto-expiring after 24 hours.',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: SITE_URL,
    },
  }
}

export function proPlanSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/getpro#pro`,
    name: `${SITE_NAME} Pro`,
    serviceType: 'Premium file sharing plan',
    category: 'File hosting',
    description: `Premium ${SITE_NAME} plan with unlimited active links, password-protected links, custom expiry dates, priority CDN delivery, 50 MB uploads, and priority support. Activated manually within 24 hours.`,
    url: `${SITE_URL}/getpro`,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: 'Worldwide',
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${SITE_URL}/getpro`,
    },
    featureList: [
      'Unlimited active links',
      'Password-protected links',
      'Custom expiry dates',
      'Priority CDN delivery',
      'Up to 50 MB per upload',
      'Custom URL paths',
      'Priority support',
    ],
    termsOfService: `${SITE_URL}/company/terms-of-service`,
  }
}

export function faqSchema(items: FAQItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

export type Crumb = { name: string; path: string }

export function breadcrumbSchema(trail: Crumb[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}

export function webPageSchema(options: {
  name: string
  description: string
  path: string
  breadcrumbTrail?: Crumb[]
  dateModified?: string
}): JsonLd {
  const { name, description, path, breadcrumbTrail, dateModified } = options

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: SITE_LANG,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    ...(breadcrumbTrail ? { breadcrumb: { '@id': `${absoluteUrl(path)}#breadcrumb` } } : {}),
    ...(dateModified ? { dateModified } : {}),
  }
}

export function graph(...nodes: JsonLd[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.map((node) => {
      const copy: JsonLd = { ...node }
      delete copy['@context']
      return copy
    }),
  }
}

export const NO_INDEX: Metadata['robots'] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false, noimageindex: true },
}

type PageMetadataOptions = {
  title: string
  description: string
  path: string
  keywords?: string[]
  type?: 'website' | 'article'
  noIndex?: boolean
  ogImage?: { url: string; width: number; height: number; alt: string }
  publishedTime?: string
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  type = 'website',
  noIndex = false,
  ogImage = {
    url: absoluteUrl(OG_IMAGE_PATH),
    width: OG_IMAGE_SIZE.width,
    height: OG_IMAGE_SIZE.height,
    alt: OG_IMAGE_ALT,
  },
  publishedTime,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    alternates: { canonical: path },
    robots: noIndex
      ? NO_INDEX
      : {
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
      type,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      title,
      description,
      images: [ogImage],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        {
          url: ogImage.url,
          alt: ogImage.alt,
          width: ogImage.width,
          height: ogImage.height,
        },
      ],
    },
  }
}
