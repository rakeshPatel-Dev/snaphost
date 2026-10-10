'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, File, FileImage, X } from 'lucide-react'
import ImagePreview from './ImagePreview'
import PdfPreview from './PdfPreview'
import FloatingBadge from './Floating'
import type { PublicBundle } from '@/types/app'
import { Button } from './ui/button'
import { formatFileSize } from '@/shared/utils/file-format'

export default function BundlePreview({ bundle }: { bundle: PublicBundle }) {
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    bundle.files.length === 1 ? bundle.files[0].id : null
  )
  const selected = selectedId ? bundle.files.find((file) => file.id === selectedId) : null
  const selectedIndex = selected ? bundle.files.findIndex((file) => file.id === selected.id) : -1

  const selectAdjacentFile = useCallback(
    (direction: -1 | 1) => {
      if (selectedIndex < 0 || bundle.files.length < 2) return
      const nextIndex = (selectedIndex + direction + bundle.files.length) % bundle.files.length
      setSelectedId(bundle.files[nextIndex].id)
    },
    [bundle.files, selectedIndex]
  )

  useEffect(() => {
    document.title = selected
      ? `${selected.filename.replace(/\.[^.]+$/, '')} | Snaphost — Instant file sharing`
      : `${bundle.name} | Snaphost — Instant file sharing`
  }, [bundle.name, selected])

  useEffect(() => {
    if (!selected || bundle.files.length < 2) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      if (event.key === 'ArrowLeft') selectAdjacentFile(-1)
      if (event.key === 'ArrowRight') selectAdjacentFile(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [bundle.files.length, selected, selectAdjacentFile])

  if (selected) {
    return (
      <div className="min-h-screen bg-background">
        {bundle.files.length > 1 && (
          <Button
            variant="outline"
            className="fixed left-4 top-4 z-30"
            onClick={() => setSelectedId(null)}
          >
            <X className="size-4" /> Back to bundle
          </Button>
        )}
        {selected.file_type === 'image' ? (
          <ImagePreview
            url={selected.url}
            filename={selected.filename}
            downloadUrl={selected.downloadUrl}
          />
        ) : (
          <PdfPreview
            url={selected.url}
            filename={selected.filename}
            downloadUrl={selected.downloadUrl}
          />
        )}
        {bundle.files.length > 1 && (
          <div className="pointer-events-none fixed inset-0 z-[60]">
            <Button
              variant="outline"
              size="icon"
              className="pointer-events-auto fixed left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/85 shadow-lg backdrop-blur"
              onClick={() => selectAdjacentFile(-1)}
              aria-label="Previous file"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="pointer-events-auto fixed right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/85 shadow-lg backdrop-blur"
              onClick={() => selectAdjacentFile(1)}
              aria-label="Next file"
            >
              <ChevronRight className="size-5" />
            </Button>
            <p className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/85 px-3 py-1.5 text-xs text-muted-foreground shadow-lg backdrop-blur">
              {selectedIndex + 1} of {bundle.files.length}
            </p>
          </div>
        )}
        <FloatingBadge />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Shared bundle</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{bundle.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{bundle.fileCount} active files</p>
          </div>
          <Link href="/" className="text-sm font-medium text-accent hover:underline">
            Upload your own
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundle.files.map((file) => {
            const Icon = file.file_type === 'pdf' ? File : FileImage
            return (
              <button
                key={file.id}
                type="button"
                onClick={() => setSelectedId(file.id)}
                className="rounded-3xl border border-border/60 bg-card p-5 text-left shadow-sm transition hover:border-accent/50 hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Icon className="size-6" />
                </div>
                <p className="mt-5 truncate font-semibold" title={file.filename}>
                  {file.filename}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {file.file_type.toUpperCase()} · {formatFileSize(Number(file.size))}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </main>
  )
}
