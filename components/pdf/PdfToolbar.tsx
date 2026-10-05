'use client'

import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Minus,
  Plus,
  Search,
  ZoomIn,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PdfToolbarProps {
  className?: string
  zoom: number
  fitZoom: number | null
  currentPage: number
  totalPages: number
  showSearch: boolean
  showThumbnails: boolean
  showOutline: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onFitToWidth: () => void
  onToggleSearch: () => void
  onToggleThumbnails: () => void
  onToggleOutline: () => void
  onPageChange: (page: number) => void
}

export default function PdfToolbar({
  className,
  zoom,
  fitZoom,
  currentPage,
  totalPages,
  showSearch,
  showThumbnails,
  showOutline,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToWidth,
  onToggleSearch,
  onToggleThumbnails,
  onToggleOutline,
  onPageChange,
}: PdfToolbarProps) {
  return (
    <div
      className={cn(
        'flex w-full shrink-0 items-center justify-between gap-1 overflow-x-auto pb-0.5 sm:w-auto sm:justify-normal sm:gap-2 sm:overflow-visible sm:pb-0',
        className
      )}
    >
      <div
        className="flex items-center rounded-full border border-border/70 bg-muted/50 p-0.5"
        role="group"
        aria-label="PDF zoom controls"
      >
        <button
          type="button"
          onClick={onZoomOut}
          disabled={zoom <= 25}
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Zoom out"
          title="Zoom out (-)"
        >
          <Minus className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onFitToWidth}
          className={cn(
            'flex size-7 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
            fitZoom !== null && zoom === fitZoom && 'bg-accent/10 text-accent'
          )}
          aria-label="Fit to width"
          title="Fit to width"
        >
          <ZoomIn className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onResetZoom}
          className="min-w-10 rounded-full px-1.5 text-xs font-medium tabular-nums text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Reset zoom to 100 percent"
          title="Reset to actual size (0)"
        >
          <span aria-live="polite">{zoom}%</span>
        </button>
        <button
          type="button"
          onClick={onZoomIn}
          disabled={zoom >= 300}
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Zoom in"
          title="Zoom in (+)"
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <div
        className="flex items-center rounded-full border border-border/70 bg-muted/50 p-0.5"
        role="group"
        aria-label="PDF page navigation"
      >
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Previous page"
          title="Previous page (←)"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
        </button>
        <span className="min-w-12 text-center text-xs font-medium tabular-nums text-foreground">
          {currentPage} / {totalPages || '—'}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Next page"
          title="Next page (→)"
        >
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSearch}
          className={cn('rounded-full', showSearch && 'bg-accent/10 text-accent')}
          aria-label="Toggle search"
          title="Search (/)"
        >
          <Search className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleThumbnails}
          className={cn('rounded-full', showThumbnails && 'bg-accent/10 text-accent')}
          aria-label="Toggle thumbnails"
          title="Thumbnails"
        >
          <LayoutGrid className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleOutline}
          className={cn('rounded-full', showOutline && 'bg-accent/10 text-accent')}
          aria-label="Toggle outline"
          title="Outline"
        >
          <Bookmark className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
