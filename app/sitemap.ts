import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/data/emails'

export const revalidate = 86400

type Entry = {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}

const ENTRIES: Entry[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/getpro', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/company', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/company/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/company/terms-of-service', changeFrequency: 'yearly', priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return ENTRIES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
