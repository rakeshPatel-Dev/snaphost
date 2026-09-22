'use client'

import { useCallback, useRef, useState } from 'react'
import { Download, Loader2, Maximize, Minus, Plus } from 'lucide-react'
import Logo from './layout/Logo'
import { cn } from '@/lib/utils'

const MIN_ZOOM = 25
const MAX_ZOOM = 200
const ZOOM_STEP = 25

interface ImagePreviewProps {
  url: string
  filename: string
  downloadUrl: string
}

export default function ImagePreview({ url, filename, downloadUrl }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [fitZoom, setFitZoom] = useState<number | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const containerRef = useRef<HTMLElement>(null)
  const renderedWidth = naturalSize ? Math.round((naturalSize.width * zoom) / 100) : undefined
  const renderedHeight = naturalSize ? Math.round((naturalSize.height * zoom) / 100) : undefined

  const fitToWindow = useCallback(() => {
    const container = containerRef.current
    if (!container || !naturalSize) return

    const computed = getComputedStyle(container)
    const availWidth =
      container.clientWidth - parseFloat(computed.paddingLeft) - parseFloat(computed.paddingRight)
    const availHeight =
      container.clientHeight - parseFloat(computed.paddingTop) - parseFloat(computed.paddingBottom)

    if (availWidth <= 0 || availHeight <= 0) return

    const fitted = Math.max(
      1,
      Math.floor(Math.min(availWidth / naturalSize.width, availHeight / naturalSize.height) * 100)
    )
    setZoom(fitted)
    setFitZoom(fitted)
  }, [naturalSize])

  const handleZoomOut = () => {
    setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP))
    setFitZoom(null)
  }

  const handleZoomIn = () => {
    setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP))
    setFitZoom(null)
  }

  const handleResetZoom = () => {
    setZoom(100)
    setFitZoom(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Logo className="hidden sm:flex" />
          <Logo className="sm:hidden [&>span]:hidden" />
          <p
            className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
            title={filename}
          >
            {filename}
          </p>
          <div
            className="flex shrink-0 items-center rounded-full border border-border/70 bg-muted/50 p-0.5"
            role="group"
            aria-label="Image zoom"
          >
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom === MIN_ZOOM}
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={fitToWindow}
              disabled={!naturalSize}
              className={cn(
                'flex size-7 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40',
                fitZoom !== null && zoom === fitZoom && 'bg-accent/10 text-accent'
              )}
              aria-label="Fit image to window"
              title="Fit to window"
            >
              <Maximize className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="min-w-10 rounded-full px-1.5 text-xs font-medium tabular-nums text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Reset image zoom to 100 percent"
              title="Reset to actual size"
            >
              <span aria-live="polite">{zoom}%</span>
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom === MAX_ZOOM}
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
          </div>
          <a
            href={downloadUrl}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label={`Download ${filename}`}
          >
            <Download className="size-3.5" aria-hidden="true" />
            <span>Download</span>
          </a>
        </div>
      </header>

      <main
        ref={containerRef}
        className="relative h-[calc(100svh-3.5rem)] overflow-auto bg-muted/35 p-4 sm:p-6"
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        )}

        {error ? (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <p className="text-sm text-muted-foreground">Failed to load image</p>
          </div>
        ) : (
          // The source is intentionally unoptimized so the viewer can render its native dimensions.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={filename}
            width={renderedWidth}
            height={renderedHeight}
            className="mx-auto block max-w-none select-none shadow-[0_12px_36px_-24px_rgba(15,23,42,0.45)]"
            draggable={false}
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget
              setNaturalSize({ width: naturalWidth, height: naturalHeight })

              const container = containerRef.current
              if (container) {
                const computed = getComputedStyle(container)
                const availWidth =
                  container.clientWidth -
                  parseFloat(computed.paddingLeft) -
                  parseFloat(computed.paddingRight)
                const availHeight =
                  container.clientHeight -
                  parseFloat(computed.paddingTop) -
                  parseFloat(computed.paddingBottom)

                if (
                  availWidth > 0 &&
                  availHeight > 0 &&
                  (naturalWidth > availWidth || naturalHeight > availHeight)
                ) {
                  const fitted = Math.max(
                    1,
                    Math.floor(
                      Math.min(availWidth / naturalWidth, availHeight / naturalHeight) * 100
                    )
                  )
                  setZoom(fitted)
                  setFitZoom(fitted)
                }
              }

              setIsLoading(false)
            }}
            onError={() => {
              setIsLoading(false)
              setError(true)
            }}
          />
        )}
      </main>
    </div>
  )
}
