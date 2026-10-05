'use client'

import { useEffect, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

interface OutlineNode {
  title: string
  dest?: string | unknown[]
  items?: OutlineNode[]
}

interface PdfOutlineProps {
  doc: PDFDocumentProxy
  onSelectPage: (pageNumber: number) => void
}

function OutlineItemView({
  node,
  doc,
  onSelectPage,
  level = 0,
}: {
  node: OutlineNode
  doc: PDFDocumentProxy
  onSelectPage: (pageNumber: number) => void
  level?: number
}) {
  const handleClick = async () => {
    try {
      if (typeof node.dest === 'string') {
        const destArray = await doc.getDestination(node.dest)
        if (destArray && destArray[0]) {
          const pageIndex = await doc.getPageIndex(destArray[0] as { num: number; gen: number })
          onSelectPage(pageIndex + 1)
        }
      } else if (Array.isArray(node.dest) && node.dest[0]) {
        const pageIndex = await doc.getPageIndex(node.dest[0] as { num: number; gen: number })
        onSelectPage(pageIndex + 1)
      }
    } catch (err) {
      console.error('Error navigating to outline item destination', err)
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        className="w-full text-left truncate rounded-md py-1 pr-2 text-xs font-medium text-foreground transition hover:bg-accent/10 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        title={node.title}
      >
        {node.title}
      </button>
      {node.items && node.items.length > 0 && (
        <div className="space-y-1 border-l border-border/40 ml-2">
          {node.items.map((sub, idx) => (
            <OutlineItemView
              key={`${sub.title}-${idx}`}
              node={sub}
              doc={doc}
              onSelectPage={onSelectPage}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PdfOutline({ doc, onSelectPage }: PdfOutlineProps) {
  const [outline, setOutline] = useState<OutlineNode[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    doc
      .getOutline()
      .then((res) => {
        if (!cancelled) {
          setOutline((res as OutlineNode[]) || null)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOutline(null)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [doc])

  return (
    <aside
      className="hidden w-60 shrink-0 overflow-y-auto border-r border-border/60 bg-muted/30 p-3 md:block"
      aria-label="Document outline"
    >
      <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Outline
      </div>
      {loading ? (
        <p className="px-1 text-xs text-muted-foreground">Loading outline...</p>
      ) : !outline || outline.length === 0 ? (
        <p className="px-1 text-xs text-muted-foreground">No outline bookmarks available.</p>
      ) : (
        <div className="space-y-0.5">
          {outline.map((item, idx) => (
            <OutlineItemView
              key={`${item.title}-${idx}`}
              node={item}
              doc={doc}
              onSelectPage={onSelectPage}
            />
          ))}
        </div>
      )}
    </aside>
  )
}
