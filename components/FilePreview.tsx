'use client';

import { Loader2 } from 'lucide-react';
import ImagePreview from './ImagePreview';
import PdfPreview from './PdfPreview';
import FloatingBadge from './Floating';
import { useGetFileQuery } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import type { FilePreviewProps } from '@/types/components';

export default function FilePreview({ fileId }: FilePreviewProps) {
  const { data: metadata, error, isLoading } = useGetFileQuery(fileId, {
    skip: !fileId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground">
          {getApiErrorMessage(error, 'File not found')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {metadata.fileType === 'image' ? (
        <ImagePreview url={metadata.url} filename={metadata.filename} />
      ) : (
        <PdfPreview url={metadata.url} filename={metadata.filename} />
      )}
      <FloatingBadge/>
    </div>
  );
}