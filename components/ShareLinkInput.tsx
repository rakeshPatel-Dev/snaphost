'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareLinkInputProps {
  fileUrl: string;
}

export default function ShareLinkInput({ fileUrl }: ShareLinkInputProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(fileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  return (
    <div className="p-4 rounded-lg bg-muted/40 border border-border">
      <p className="text-xs text-muted-foreground mb-2 font-medium">Share Link</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={fileUrl}
          readOnly
          className="flex-1 text-xs bg-background rounded px-3 py-2 border border-border truncate font-mono"
        />
        <Button
          size="sm"
          variant={copied ? 'default' : 'outline'}
          onClick={copyLink}
          className="shrink-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
