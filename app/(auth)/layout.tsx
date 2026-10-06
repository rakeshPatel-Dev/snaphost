import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { NO_INDEX, SITE_NAME } from '@/lib/seo'

export const metadata: Metadata = {
  title: {
    default: `Sign in | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Sign in to ${SITE_NAME} to manage uploads, custom URLs, and expiry settings.`,
  robots: NO_INDEX,
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children
}
