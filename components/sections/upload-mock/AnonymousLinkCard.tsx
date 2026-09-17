'use client';

import { useState } from 'react';
import ShareModal from '@/components/ShareModal';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { Check, Copy, ExternalLink, Share2, Trash2, Clock } from 'lucide-react';
import { formatShortDate, getTimeRemaining } from '@/services/anonymous-links';
import type { AnonymousLinkCardProps } from '@/types/components';

export default function AnonymousLinkCard({
  id,
  filename,
  fileType,
  fileSize,
  url,
  expiresAt,
  createdAt,
  copied,
  onCopy,
  onOpen,
  onDelete,
}: AnonymousLinkCardProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  return (
    <>
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        fileUrl={url}
        filename={filename}
      />

      <div className="rounded-4xl border border-border/60 bg-card/80 p-4 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:p-5">
        {/* Header: file info + actions */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/40 text-xs font-semibold tracking-wide text-foreground sm:h-11 sm:w-11 sm:text-xs">
            {fileType === 'pdf' ? 'PDF' : 'IMG'}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium tracking-tight text-foreground">
              {filename}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {fileSize} · {formatShortDate(createdAt)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              size="sm"
              variant="secondary"
              className="shrink-0 border border-border px-2.5 sm:px-3"
              onClick={() => onOpen(url)}
              aria-label="Open in new tab"
              title="Open"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Open</span>
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              onClick={() => setShareModalOpen(true)}
              aria-label="Share link"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>

            <DeleteConfirmDialog
              trigger={
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete link"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
              title="Delete this link?"
              description="The file will be removed from storage and this browser's history."
              confirmLabel="Delete"
              destructiveClassName="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onConfirm={() => onDelete(id)}
            />
          </div>
        </div>

        {/* URL row */}
        <div className="mt-3 flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 py-2 pl-3.5 pr-1.5 sm:mt-3.5">
          <p className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
            {url}
          </p>
          <button
            type="button"
            onClick={() => onCopy(url, id)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
            aria-label={copied ? 'Copied' : 'Copy link'}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Footer meta */}
        <div className="mt-2.5 flex items-center gap-2 px-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {getTimeRemaining(expiresAt)}
          </span>
        </div>
      </div>
    </>
  );
}