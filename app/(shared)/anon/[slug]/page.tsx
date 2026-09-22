import type { Metadata } from 'next'
import FilePreview from '@/components/FilePreview'
import { getFilePageMetadata } from '@/lib/file-page-metadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return getFilePageMetadata(slug, { isAnonymous: true })
}

export default async function AnonymousFilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (!slug) return null

  return <FilePreview fileId={slug} isAnonymous />
}
