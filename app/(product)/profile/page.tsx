import type { Metadata } from 'next'
import { ProfileGate } from '@/features/profile'
import { NO_INDEX, SITE_NAME } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: `Manage your ${SITE_NAME} uploads, custom URLs, expiry settings, and account.`,
  robots: NO_INDEX,
}

export default async function ProfilePage() {
  return <ProfileGate />
}
