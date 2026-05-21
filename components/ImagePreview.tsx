'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  url: string;
  filename: string;
}

export default function ImagePreview({ url, filename }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full bg-muted flex items-center justify-center min-h-96">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Failed to load image
          </p>
        </div>
      ) : (
        <Image
          width={0}
          height={0}
          src={url}
          alt={filename}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
          className="max-w-full max-h-96 object-contain"
        />
      )}
    </div>
  );
}
