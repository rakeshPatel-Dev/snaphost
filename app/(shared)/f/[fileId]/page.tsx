import type { Metadata } from 'next'
import FilePageClient from './FilePageClient'
import { getFilePageMetadata } from '@/lib/file-page-metadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fileId: string }>
}): Promise<Metadata> {
  const { fileId } = await params
  return getFilePageMetadata(fileId)
}

export default async function FilePage({
  params,
  searchParams,
}: {
  params: Promise<{ fileId: string }>
  searchParams: Promise<{ success?: string }>
}) {
  const { fileId } = await params
  const { success } = await searchParams

  if (!fileId) return null

  return <FilePageClient fileId={fileId} showSuccess={success === 'true'} />
}
