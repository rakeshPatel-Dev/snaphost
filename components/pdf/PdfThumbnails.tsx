'use client'

import { useEffect, useRef } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

interface PdfThumbnailsProps {
  doc: PDFDocumentProxy
  currentPage: number
  onSelectPage: (pageNumber: number) => void
}

function ThumbnailItem({
  doc,
  pageNumber,
  isActive,
  onSelect,
}: {
  doc: PDFDocumentProxy
  pageNumber: number
  isActive: boolean
  onSelect: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false
    doc.getPage(pageNumber).then((page) => {
      if (cancelled || !canvasRef.current) return
      const vp = page.getViewport({ scale: 0.18 })
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      canvas.width = Math.floor(vp.width)
      canvas.height = Math.floor(vp.height)
      page.render({ canvasContext: ctx, viewport: vp })
    })
    return () => {
      cancelled = true
    }
  }, [doc, pageNumber])

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex flex-col items-center gap-1 rounded-md p-1.5 transition ${
        isActive
          ? 'bg-accent/15 ring-2 ring-accent'
          : 'hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring'
      }`}
      aria-label={`Go to page ${pageNumber}`}
    >
      <div className="overflow-hidden rounded border border-border/70 bg-white shadow-xs">
        <canvas ref={canvasRef} className="block" />
      </div>
      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
        {pageNumber}
      </span>
    </button>
  )
}

export default function PdfThumbnails({ doc, currentPage, onSelectPage }: PdfThumbnailsProps) {
  const pages = Array.from({ length: doc.numPages }, (_, i) => i + 1)

  return (
    <aside
      className="hidden w-44 shrink-0 overflow-y-auto border-r border-border/60 bg-muted/30 p-2.5 md:block"
      aria-label="Page thumbnails"
    >
      <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Pages ({doc.numPages})
      </div>
      <div className="flex flex-col gap-2">
        {pages.map((p) => (
          <ThumbnailItem
            key={p}
            doc={doc}
            pageNumber={p}
            isActive={currentPage === p}
            onSelect={() => onSelectPage(p)}
          />
        ))}
      </div>
    </aside>
  )
}
