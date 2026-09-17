'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2, ExternalLink, File, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnonymousLink } from '@/types/app';
import { deleteAnonymousLink, fetchAnonymousLinks } from '@/services/anonymous-links';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { getApiErrorMessage } from '@/lib/api-error';
import { ANON_ERRORS } from '@/lib/messages';

export default function AnonLinks() {
  const [files, setFiles] = useState<AnonymousLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadLinks = async (showRefreshToast = false) => {
    try {
      const nextFiles = await fetchAnonymousLinks();
      setFiles(nextFiles);
      if (showRefreshToast && nextFiles.length > 0) {
        toast.success(`Loaded ${nextFiles.length} link${nextFiles.length === 1 ? '' : 's'}`);
      }
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to load links');

      if (message.toLowerCase().includes('session')) {
        setFiles([]);
        toast.info('No active anonymous session found', {
          description: 'Upload a file anonymously to start a session',
        });
        return;
      }

      console.error('anon links load', err);
      toast.error(ANON_ERRORS.failedToLoadLinks);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      await loadLinks(false);
      if (mounted) setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteAnonymousLink(id);
      setFiles((s) => s.filter((f) => f.id !== id));
      toast.success('Link deleted successfully');
    } catch (err) {
      console.error('delete anon', err);
      toast.error(ANON_ERRORS.failedToDeleteLink);
    } finally {
      setDeleting(null);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadLinks(true);
    setRefreshing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your links…</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
        <File className="h-5 w-5 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No links yet</p>
          <p className="text-xs text-muted-foreground">
            Upload a file anonymously to see it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            {files.length} active link{files.length === 1 ? '' : 's'} · expires in 24h
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-full border border-border/60 bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/30"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <File className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{file.filename}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                  <span>{file.fileSize}</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {file.expiresAt ? new Date(file.expiresAt).toLocaleDateString() : '24h'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open link"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>

              <DeleteConfirmDialog
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={deleting === file.id}
                    aria-label="Delete link"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    {deleting === file.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                }
                title="Delete this anonymous link?"
                description={`This will permanently remove "${file.filename}" and its link. This action cannot be undone.`}
                confirmLabel="Delete link"
                destructiveClassName="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onConfirm={() => handleDelete(file.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
