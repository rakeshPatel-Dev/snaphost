'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Loader2, Unlink } from 'lucide-react';
import ImagePreview from './ImagePreview';
import PdfPreview from './PdfPreview';
import FloatingBadge from './Floating';
import { Button } from './ui/button';
import { useGetFileQuery } from '@/state/api';
import { getApiErrorMessage } from '@/lib/api-error';
import type { FilePreviewProps } from '@/types/components';

function getPreviewTitle(filename: string): string {
  const extensionStart = filename.lastIndexOf('.');
  const displayName = extensionStart > 0 ? filename.slice(0, extensionStart) : filename;

  return `${displayName} | Snaphost — Instant file sharing`;
}

export default function FilePreview({ fileId, isAnonymous = false, username }: FilePreviewProps) {
  const { data: metadata, error, isLoading } = useGetFileQuery(
    { fileId, username },
    { skip: !fileId }
  );

  useEffect(() => {
    if (metadata) {
      document.title = getPreviewTitle(metadata.filename);
    }
  }, [metadata]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !metadata) {
    const isNotFound =
      !error ||
      (typeof error === 'object' && error !== null && 'status' in error && error.status === 404);

    return (
      <div className="min-h-screen bg-background">
        <main className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4 py-12 sm:px-6">
          <section className="w-full max-w-md rounded-4xl border border-border/70 bg-card p-7 text-center shadow-[0_24px_70px_-44px_rgba(15,23,42,0.28)] sm:p-10">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Unlink className="size-7" strokeWidth={1.7} aria-hidden="true" />
            </div>

            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {isAnonymous && isNotFound
                ? 'This link has expired'
                : isNotFound
                  ? 'Link not found'
                  : 'Unable to load file'}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              {isAnonymous && isNotFound
                ? 'This temporary snap link was available for 24 hours.'
                : isNotFound
                  ? 'This snap link may have expired or the file may have been deleted.'
                  : getApiErrorMessage(error, 'Something went wrong while loading this file. Please try again.')}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <Button asChild className="w-full h-10 px-4 sm:w-auto">
                <Link href="/upload">Upload new file</Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-10 px-4 sm:w-auto">
                <Link href="/">Go to Snaphost</Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {metadata.fileType === 'image' ? (
        <ImagePreview
          url={metadata.url}
          filename={metadata.filename}
          downloadUrl={metadata.downloadUrl}
        />
      ) : (
        <PdfPreview url={metadata.url} filename={metadata.filename} />
      )}
      <FloatingBadge />
    </div>
  );
}
