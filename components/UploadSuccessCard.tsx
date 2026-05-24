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

      <div className="border border-border rounded-lg p-8 bg-card">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
        </div>

        {/* Success Message */}
        <h3 className="text-center text-xl font-semibold text-foreground mb-1">
          File Uploaded!
        </h3>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Your file is ready to share
        </p>

        {/* File Details */}
        <div className="mb-4">
          <FileDetailsCard
            filename={filename}
            fileSize={fileSize}
            optimizedSize={optimizedSize}
          />
        </div>

        {/* Share Link */}
        <div className="mb-6">
          <ShareLinkInput fileUrl={fileUrl} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => setShareModalOpen(true)}
            className="flex-1 gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            onClick={onUploadMore}
            variant="outline"
            className="flex-1 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Upload More
          </Button>
        </div>
      </div>
    </>
  );
}
