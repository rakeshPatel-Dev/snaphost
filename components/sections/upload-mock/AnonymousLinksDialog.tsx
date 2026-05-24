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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>All anonymous links</DialogTitle>
          <DialogDescription>
            These links are stored only in this browser and expire automatically after 24 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {links.map((item) => (
            <AnonymousLinkCard
              key={item.id}
              {...item}
              copied={copiedId === item.id}
              onCopy={onCopy}
              onOpen={onOpen}
              onDelete={onDelete}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
