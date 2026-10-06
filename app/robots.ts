import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/data/emails'

const NON_INDEXABLE_PREFIXES = [
  '/api/',
  '/auth/',
  '/profile',
  '/anon/links',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/check-email',
  '/monitoring',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: NON_INDEXABLE_PREFIXES,
      },
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
        ],
        allow: '/',
        disallow: ['/api/', '/auth/', '/profile', '/anon/links', '/sign-in', '/sign-up'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
