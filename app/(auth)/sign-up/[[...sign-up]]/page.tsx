import type { Metadata } from 'next'
import { AuthScreen } from '@/features/auth'
import { NO_INDEX, SITE_NAME } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Create account',
  description: `Sign up for ${SITE_NAME} to manage uploads, pick custom URLs, and control link expiry.`,
  robots: NO_INDEX,
}

export default function Page() {
  return <AuthScreen mode="sign-up" />
}
