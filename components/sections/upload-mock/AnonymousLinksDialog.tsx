'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AnonymousLinkCard from './AnonymousLinkCard';
import type { AnonymousLinksDialogProps } from '@/types/components';

export default function AnonymousLinksDialog({
  open,
  onOpenChange,
  links,
  copiedId,
  onCopy,
  onOpen,
  onDelete,
}: AnonymousLinksDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" max-w-[30vw]!">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl">Anonymous Links</DialogTitle>
          <DialogDescription>
            Links are automatically deleted 24 hours after creation.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1 scrollbar-thin">
          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No anonymous links yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Upload files anonymously to see them here
              </p>
            </div>
          ) : (
            links.map((item) => (
              <AnonymousLinkCard
                key={item.id}
                {...item}
                copied={copiedId === item.id}
                onCopy={onCopy}
                onOpen={onOpen}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}