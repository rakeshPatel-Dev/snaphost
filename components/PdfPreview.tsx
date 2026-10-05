'use client'

import dynamic from 'next/dynamic'
import type { PdfPreviewProps } from '@/types/components'
import BrandLoader from '@/components/shared/BrandLoader'

const PdfViewer = dynamic(() => import('./pdf/PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-background">
      <BrandLoader size="lg" label="Loading PDF viewer" />
    </div>
  ),
})

export default function PdfPreview({ url, filename, downloadUrl }: PdfPreviewProps) {
  return <PdfViewer url={url} filename={filename} downloadUrl={downloadUrl} />
}
