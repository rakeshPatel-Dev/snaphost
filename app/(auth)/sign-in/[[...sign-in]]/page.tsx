import type { Metadata } from 'next'
import { AuthScreen } from '@/features/auth'
import { NO_INDEX, SITE_NAME } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Sign in',
  description: `Sign in to manage your ${SITE_NAME} uploads, custom URLs, and expiry settings.`,
  robots: NO_INDEX,
}

export default function Page() {
  return <AuthScreen mode="sign-in" />
}
