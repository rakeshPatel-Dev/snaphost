'use client';

import { useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PdfPreviewProps {
  url: string;
  filename: string;
}

export default function PdfPreview({ url, filename }: PdfPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // For MVP, we use iframe for PDF preview
  // React-pdf requires special setup with pdfjs worker
  // iframe is simpler and works cross-browser

  return (
    <div className="w-full">
      <div className="relative w-full bg-muted min-h-96 flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        <iframe
          src={url}
          title={filename}
          className="w-full h-screen max-h-96 border-0"
          onLoad={() => setIsLoading(false)}
          style={{
            aspectRatio: '8.5 / 11',
          }}
        />
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
        <p>PDF Preview • Download to view in detail</p>
      </div>
    </div>
  );
}
