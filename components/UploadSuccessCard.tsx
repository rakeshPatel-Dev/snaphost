'use client';

import { useState } from 'react';
import { Check, Share2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShareModal from './ShareModal';
import FileDetailsCard from './FileDetailsCard';
import ShareLinkInput from './ShareLinkInput';
import type { UploadSuccessCardProps } from '@/types/components';

export default function UploadSuccessCard({
  filename,
  fileUrl,
  fileSize,
  optimizedSize,
  onUploadMore,
}: UploadSuccessCardProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  return (
    <>
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        fileUrl={fileUrl}
        filename={filename}
      />

      <div className="rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)]">
        <div className="flex justify-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 border border-accent/20">
            <Check className="h-6 w-6 text-accent" />
          </div>
        </div>

        <h3 className="text-center text-xl font-semibold tracking-tight text-foreground mb-1">
          File uploaded
        </h3>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Your file is ready to share
        </p>

        <div className="mb-4">
          <FileDetailsCard
            filename={filename}
            fileSize={fileSize}
            optimizedSize={optimizedSize}
          />
        </div>

        <div className="mb-6">
          <ShareLinkInput fileUrl={fileUrl} />
        </div>

        <div className="flex gap-3">
          <Button
            size="lg"
            onClick={() => setShareModalOpen(true)}
            className="flex-1 h-11 px-6 gap-2 cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            size="lg"
            onClick={onUploadMore}
            variant="outline"
            className="flex-1 h-11 px-6 gap-2 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Upload more
          </Button>
        </div>
      </div>
    </>
  );
}
