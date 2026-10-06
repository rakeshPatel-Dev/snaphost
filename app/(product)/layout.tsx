import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { NO_INDEX, SITE_NAME } from '@/lib/seo'

export const metadata: Metadata = {
  title: {
    default: `Dashboard | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Manage your ${SITE_NAME} uploads, links, and account settings.`,
  robots: NO_INDEX,
}

export default function ProductLayout({ children }: { children: ReactNode }) {
  return children
}
