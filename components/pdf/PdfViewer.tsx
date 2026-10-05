'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, Unlink } from 'lucide-react'
import * as pdfjs from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import Logo from '@/components/layout/Logo'
import PdfOutline from './PdfOutline'
import PdfPage from './PdfPage'
import PdfSearch from './PdfSearch'
import PdfThumbnails from './PdfThumbnails'
import PdfToolbar from './PdfToolbar'
import BrandLoader from '@/components/shared/BrandLoader'
import './pdf-viewer.css'

if (typeof window !== 'undefined' && pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()
}

interface PdfViewerProps {
  url: string
  filename: string
  downloadUrl: string
}

export default function PdfViewer({ url, filename, downloadUrl }: PdfViewerProps) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [showSearch, setShowSearch] = useState(false)
  const [showThumbnails, setShowThumbnails] = useState(false)
  const [showOutline, setShowOutline] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  const [prevUrl, setPrevUrl] = useState(url)
  if (url !== prevUrl) {
    setPrevUrl(url)
    setLoading(true)
    setError(false)
    setDoc(null)
    setCurrentPage(1)
  }

  // Load PDF Document
  useEffect(() => {
    let cancelled = false

    const loadingTask = pdfjs.getDocument({
      url,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
      cMapPacked: true,
    })

    loadingTask.promise
      .then((loadedDoc) => {
        if (!cancelled) {
          setDoc(loadedDoc)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load PDF document', err)
          setError(true)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
      loadingTask.destroy()
    }
  }, [url])

  const totalPages = doc?.numPages || 1
  const zoomPercent = Math.round(scale * 100)

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(3.0, Number((s + 0.25).toFixed(2))))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(0.25, Number((s - 0.25).toFixed(2))))
  }, [])

  const handleResetZoom = useCallback(() => {
    setScale(1.0)
  }, [])

  const fitToWidth = useCallback(() => {
    if (!doc || !containerRef.current) {
      setScale(1.0)
      return
    }
    doc.getPage(1).then((page) => {
      const defaultVp = page.getViewport({ scale: 1.0 })
      const container = containerRef.current
      if (!container) return
      const styles = window.getComputedStyle(container)
      const horizontalPadding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
      const targetWidth = Math.max(1, container.clientWidth - horizontalPadding - 16)
      const fittedScale = Number(Math.min(1, targetWidth / defaultVp.width).toFixed(2))
      setScale(fittedScale)
    })
  }, [doc])

  const handleFitToWidth = fitToWidth

  useEffect(() => {
    if (!doc || !containerRef.current) return

    fitToWidth()
    window.addEventListener('resize', fitToWidth)
    return () => window.removeEventListener('resize', fitToWidth)
  }, [doc, fitToWidth])

  const handleSelectPage = useCallback((pageNumber: number) => {
    const el = document.getElementById(`pdf-page-${pageNumber}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setCurrentPage(pageNumber)
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === '+' || e.key === '=') {
        handleZoomIn()
      } else if (e.key === '-') {
        handleZoomOut()
      } else if (e.key === '0') {
        handleResetZoom()
      } else if (e.key === '/') {
        e.preventDefault()
        setShowSearch((s) => !s)
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handleSelectPage(Math.max(1, currentPage - 1))
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleSelectPage(Math.min(totalPages, currentPage + 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleZoomIn, handleZoomOut, handleResetZoom, handleSelectPage, currentPage, totalPages])

  const pageNumbers = doc ? Array.from({ length: doc.numPages }, (_, i) => i + 1) : []

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex min-h-14 max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:flex-nowrap sm:gap-3 sm:px-6 sm:py-0">
          <div className="order-1 flex min-w-0 flex-1 items-center gap-3">
            <Logo className="hidden sm:flex" />
            <Logo className="sm:hidden [&>span]:hidden" />
            <p
              className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
              title={filename}
            >
              {filename}
            </p>
          </div>
          <PdfToolbar
            className="order-3 sm:order-2"
            zoom={zoomPercent}
            fitZoom={null}
            currentPage={currentPage}
            totalPages={totalPages}
            showSearch={showSearch}
            showThumbnails={showThumbnails}
            showOutline={showOutline}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            onFitToWidth={handleFitToWidth}
            onToggleSearch={() => setShowSearch((s) => !s)}
            onToggleThumbnails={() => {
              setShowThumbnails((s) => !s)
              if (!showThumbnails) setShowOutline(false)
            }}
            onToggleOutline={() => {
              setShowOutline((s) => !s)
              if (!showOutline) setShowThumbnails(false)
            }}
            onPageChange={handleSelectPage}
          />
          <a
            href={downloadUrl}
            className="order-2 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-accent px-2.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:order-3 sm:px-3"
            aria-label={`Download ${filename}`}
          >
            <Download className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </header>

      {showSearch && <PdfSearch onClose={() => setShowSearch(false)} />}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {showThumbnails && doc && (
          <PdfThumbnails doc={doc} currentPage={currentPage} onSelectPage={handleSelectPage} />
        )}
        {showOutline && doc && <PdfOutline doc={doc} onSelectPage={handleSelectPage} />}

        <main ref={containerRef} className="relative flex-1 overflow-auto bg-muted/30 p-4 sm:p-6">
          {loading && (
            <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3">
              <BrandLoader size="lg" label="Loading PDF" />
              <p className="text-xs text-muted-foreground">Loading PDF...</p>
            </div>
          )}

          {error && (
            <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <Unlink className="size-7" strokeWidth={1.7} aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-foreground">Failed to load PDF</p>
              <p className="text-xs text-muted-foreground">
                The file may be corrupted or cannot be displayed.
              </p>
            </div>
          )}

          {!loading && !error && doc && (
            <div className="mx-auto flex flex-col items-center gap-6">
              {pageNumbers.map((p) => (
                <PdfPage
                  key={p}
                  doc={doc}
                  pageNumber={p}
                  scale={scale}
                  onVisible={setCurrentPage}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
