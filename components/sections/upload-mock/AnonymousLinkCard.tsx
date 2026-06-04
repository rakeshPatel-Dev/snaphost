'use client';

import { useState } from 'react';
import ShareModal from '@/components/ShareModal';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import {
  Check,
  Copy,
  ExternalLink,
  MoreVertical,
  Share2,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/20">
                <span className="text-[10px] font-bold text-foreground">
                  {fileType === 'pdf' ? 'PDF' : 'IMG'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{filename}</p>
                <p className="text-[11px] text-muted-foreground">
                  Created {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(createdAt))} • {fileSize}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
              <p className="truncate font-mono text-[11px] text-foreground">{url}</p>
            </div>

            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-accent/60" />
                Created {formatShortDate(createdAt)}
              </span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>{getTimeRemaining(expiresAt)}</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5"
              onClick={() => onCopy(url, id)}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 gap-1.5">
                  <MoreVertical className="h-3.5 w-3.5" />
                  Actions
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-20">
                <DropdownMenuItem onClick={() => onOpen(url)}>
                  <ExternalLink className="h-4 w-4" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShareModalOpen(true)}>
                  <Share2 className="h-4 w-4" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DeleteConfirmDialog
              trigger={(
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
              title="Delete this anonymous link?"
              description="This will remove the file from storage, delete the database record, and remove it from this browser's local history."
              confirmLabel="Delete link"
              destructiveClassName="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onConfirm={() => onDelete(id)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
