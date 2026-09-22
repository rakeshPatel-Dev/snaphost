'use client'

import { UploadCloud, Link2 } from 'lucide-react'
import type { UploadMockTabsProps } from '@/types/components'

const base =
  'flex min-w-0 items-center justify-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 text-center sm:shrink-0 sm:whitespace-nowrap sm:px-3.5'

const active =
  'bg-muted/30 text-foreground shadow-sm shadow-black/5 dark:shadow-black/20 ring-1 ring-white/5'

const inactive = 'text-muted-foreground hover:bg-muted/50 hover:text-foreground shadow-none'

export default function UploadMockTabs({
  activeTab,
  onTabChange,
  linksCount,
}: UploadMockTabsProps) {
  return (
    <div
      role="tablist"
      className="grid grid-cols-2 gap-1.5 pb-3 mb-5 sm:flex sm:overflow-x-auto sm:no-scrollbar"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'upload'}
        onClick={() => onTabChange('upload')}
        className={`${base} ${activeTab === 'upload' ? active : inactive}`}
      >
        <UploadCloud className="h-3.5 w-3.5" />

        {/* Short label — mobile only */}
        <span className="sm:hidden">Upload</span>

        {/* Full label — sm and up */}
        <span className="hidden sm:inline">Anonymous upload</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'links'}
        onClick={() => onTabChange('links')}
        className={`${base} ${activeTab === 'links' ? active : inactive}`}
      >
        <Link2 className="h-3.5 w-3.5" />

        {/* Short label — mobile only */}
        <span className="sm:hidden">Links{linksCount ? ` (${linksCount})` : ''}</span>

        {/* Full label — sm and up */}
        <span className="hidden sm:inline">Created links ({linksCount})</span>
      </button>
    </div>
  )
}
