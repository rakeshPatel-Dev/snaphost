'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ImagePreview from './ImagePreview';
import PdfPreview from './PdfPreview';
import { FileMetadata } from '@/lib/database';
import FloatingBadge from './Floating';

interface FilePreviewProps {
  fileId: string;
}

export default function FilePreview({ fileId }: FilePreviewProps) {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(`/api/files/${fileId}`);
        if (!response.ok) {
          setError('File not found');
          setLoading(false);
          return;
        }
        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setError('Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [fileId]);

  if (loading) {
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
          {error || 'File not found'}
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