'use client';

import { UploadCloud, Link2 } from 'lucide-react';
import type { UploadMockTabsProps } from '@/types/components';

export default function UploadMockTabs({ activeTab, onTabChange, linksCount }: UploadMockTabsProps) {
  return (
    <div className="flex border-b border-border/60 pb-3 mb-5 gap-1.5 overflow-x-auto no-scrollbar">
      <button
        onClick={() => onTabChange('upload')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeTab === 'upload' ? 'bg-muted/20 text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
      >
        <UploadCloud className="h-3.5 w-3.5" />
        Anonymous upload
      </button>
      <button
        onClick={() => onTabChange('links')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeTab === 'links' ? 'bg-muted/20 text-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
      >
        <Link2 className="h-3.5 w-3.5" />
        Created links ({linksCount})
      </button>
    </div>
  );
}
