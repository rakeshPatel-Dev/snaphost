'use client';

import { useState, useEffect } from 'react';
import { Download, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ImagePreview from './ImagePreview';
import PdfPreview from './PdfPreview';
import { FileMetadata } from '@/lib/database';

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
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {error || 'File Not Found'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          The file you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/f/${fileId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = metadata.url;
    a.download = metadata.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* File Info Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 break-words">
            {metadata.filename}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Uploaded {new Date(metadata.createdAt).toLocaleDateString()} at{' '}
            {new Date(metadata.createdAt).toLocaleTimeString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {(metadata.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>

        {/* File Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 overflow-hidden">
          {metadata.fileType === 'image' ? (
            <ImagePreview url={metadata.url} filename={metadata.filename} />
          ) : (
            <PdfPreview url={metadata.url} filename={metadata.filename} />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleCopyLink}
            variant="default"
            className="flex-1 sm:flex-none"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
