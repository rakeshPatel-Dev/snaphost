import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { NO_INDEX } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Signing you in',
  robots: NO_INDEX,
}

export default async function AuthSyncPage() {
  redirect('/profile')
}
