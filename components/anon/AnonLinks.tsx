'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2, ExternalLink, File, Clock, RefreshCw } from 'lucide-react';
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your links...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/20 py-12 px-4 text-center">
        <div className="rounded-full bg-muted/50 p-3">
          <File className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No anonymous links yet</p>
          <p className="text-xs text-muted-foreground">
            Upload a file anonymously to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold">Anonymous Links</h3>
          <p className="text-xs text-muted-foreground">
            {files.length} active link{files.length === 1 ? '' : 's'} • Auto-deletes in 24h
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Links list */}
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="group relative flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-all hover:border-border/80 hover:shadow-sm"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {/* File icon */}
              <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted/30">
                <File className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* File details */}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-medium">{file.filename}</p>
                <p className="truncate text-sm font-medium underline">
                  <a href={file.url}>
                    {file.url}
                  </a>
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{file.fileSize}</span>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Expires in {file.expiresAt ? new Date(file.expiresAt).toLocaleDateString() : '24h'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Open link"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <DeleteConfirmDialog
                trigger={(
                  <button
                    type="button"
                    disabled={deleting === file.id}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    title="Delete link"
                  >
                    {deleting === file.id ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
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