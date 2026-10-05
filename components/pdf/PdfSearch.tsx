'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PdfSearchProps {
  onClose?: () => void
}

export default function PdfSearch({ onClose }: PdfSearchProps) {
  const [query, setQuery] = useState('')
  const [matchCount, setMatchCount] = useState(0)
  const [currentMatch, setCurrentMatch] = useState(0)
  const [matches, setMatches] = useState<HTMLElement[]>([])

  const clearHighlights = useCallback(() => {
    const existing = document.querySelectorAll('.textLayer .highlight, .textLayer mark')
    existing.forEach((el) => {
      el.classList.remove('highlight', 'selected')
    })
  }, [])

  const executeSearch = useCallback(
    (searchTerm: string) => {
      clearHighlights()
      const trimmed = searchTerm.trim().toLowerCase()
      if (!trimmed) {
        setMatches([])
        setMatchCount(0)
        setCurrentMatch(0)
        return
      }

      const spans = Array.from(document.querySelectorAll<HTMLElement>('.textLayer span'))
      const found: HTMLElement[] = []

      for (const span of spans) {
        const text = span.textContent?.toLowerCase() || ''
        if (text.includes(trimmed)) {
          span.classList.add('highlight')
          found.push(span)
        }
      }

      setMatches(found)
      setMatchCount(found.length)
      if (found.length > 0) {
        setCurrentMatch(1)
        found[0].classList.add('selected')
        found[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        setCurrentMatch(0)
      }
    },
    [clearHighlights]
  )

  const handleSearch = (value: string) => {
    setQuery(value)
    executeSearch(value)
  }

  const highlightMatch = (index: number) => {
    if (matches.length === 0) return
    matches.forEach((el) => el.classList.remove('selected'))
    const target = matches[index]
    if (target) {
      target.classList.add('selected')
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const goToNextMatch = () => {
    if (matchCount > 0) {
      const next = (currentMatch % matchCount) + 1
      setCurrentMatch(next)
      highlightMatch(next - 1)
    }
  }

  const goToPrevMatch = () => {
    if (matchCount > 0) {
      const prev = ((currentMatch - 2 + matchCount) % matchCount) + 1
      setCurrentMatch(prev)
      highlightMatch(prev - 1)
    }
  }

  const handleClear = () => {
    setQuery('')
    executeSearch('')
  }

  useEffect(() => {
    return () => {
      clearHighlights()
    }
  }, [clearHighlights])

  return (
    <div className="border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-2 px-4 sm:px-6">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <Input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (e.shiftKey) goToPrevMatch()
              else goToNextMatch()
            } else if (e.key === 'Escape') {
              handleClear()
              onClose?.()
            }
          }}
          placeholder="Search in PDF..."
          className="h-8 flex-1 rounded-full border-input bg-transparent text-sm"
          aria-label="Search in PDF"
          autoFocus
        />
        {query && (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {currentMatch} / {matchCount}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={goToPrevMatch}
          disabled={!query || matchCount === 0}
          className="rounded-full"
          aria-label="Previous match"
        >
          <ChevronUp className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={goToNextMatch}
          disabled={!query || matchCount === 0}
          className="rounded-full"
          aria-label="Next match"
        >
          <ChevronDown className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => {
            handleClear()
            onClose?.()
          }}
          className="rounded-full"
          aria-label="Close search"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
