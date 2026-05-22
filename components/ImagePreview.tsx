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
    <div className="relative w-full min-h-screen bg-background flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error ? (
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load image</p>
        </div>
      ) : (
        <Image
          src={url}
          alt={filename}
          fill
          sizes="100vw"
          className="object-contain"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
          priority
        />
      )}
    </div>
  );
}