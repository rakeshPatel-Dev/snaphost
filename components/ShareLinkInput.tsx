'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { ShareLinkInputProps } from '@/types/components';

export default function ShareLinkInput({ fileUrl }: ShareLinkInputProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(fileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  return (
    <div className="rounded-2xl bg-muted/20 border border-border/60 p-4">
      <p className="text-xs text-muted-foreground mb-2 font-medium">Share link</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={fileUrl}
          readOnly
          title="Share link"
          aria-label="Share link"
          className="flex-1 text-xs bg-background rounded-full px-3 py-2 border border-border/60 truncate font-mono text-foreground"
        />
        <Button
          size="sm"
          variant={copied ? 'default' : 'outline'}
          onClick={copyLink}
          className="shrink-0 rounded-full"
        >
          {copied ? (
            <Check className="h-4 w-4 text-accent" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
