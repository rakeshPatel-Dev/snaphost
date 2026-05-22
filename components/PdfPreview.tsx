'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PdfPreviewProps {
  url: string;
  filename: string;
}

export default function PdfPreview({ url, filename }: PdfPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="w-full min-h-screen">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-10">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      <iframe
        src={url}
        title={filename}
        className="w-full h-screen border-0"
        onLoad={() => setIsLoading(false)}
        allowFullScreen
      />
    </div>
  );
}