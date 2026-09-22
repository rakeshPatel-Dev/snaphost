'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2, ExternalLink, File, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog'
import { useDeleteAnonymousLinkMutation, useGetAnonymousLinksQuery } from '@/state/api'
import { ANON_ERRORS } from '@/lib/messages'

function isNoSessionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const maybe = error as { status?: unknown; data?: unknown }

  if (maybe.status !== 401 || !maybe.data || typeof maybe.data !== 'object') {
    return false
  }

  const message = (maybe.data as { error?: unknown }).error
  return typeof message === 'string'
}

export default function AnonLinks() {
  const { data: files = [], isLoading, isFetching, error, refetch } = useGetAnonymousLinksQuery()
  const [deleteLink, { isLoading: isDeleting }] = useDeleteAnonymousLinkMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadLinks = async (showRefreshToast = false) => {
    setRefreshing(true)
    try {
      const nextFiles = await refetch().unwrap()
      if (showRefreshToast && nextFiles.length > 0) {
        toast.success(`Loaded ${nextFiles.length} link${nextFiles.length === 1 ? '' : 's'}`)
      }
    } catch (err) {
      if (isNoSessionError(err)) {
        toast.info('No active anonymous session found', {
          description: 'Upload a file anonymously to start a session',
        })
        return
      }

      console.error('anon links load', err)
      toast.error(ANON_ERRORS.failedToLoadLinks)
    } finally {
      setRefreshing(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await deleteLink(id).unwrap()
      toast.success('Link deleted successfully')
    } catch (err) {
      console.error('delete anon', err)
      toast.error(ANON_ERRORS.failedToDeleteLink)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your links…</p>
        </div>
      </div>
    )
  }

  if (error && !isNoSessionError(error)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
        <File className="h-5 w-5 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Could not load your links</p>
          <p className="text-xs text-muted-foreground">{ANON_ERRORS.failedToLoadLinks}</p>
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
        <File className="h-5 w-5 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No links yet</p>
          <p className="text-xs text-muted-foreground">Upload a file anonymously to see it here.</p>
        </div>
      </div>
    )
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
          onClick={() => loadLinks(true)}
          disabled={refreshing || isFetching}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing || isFetching ? 'animate-spin' : ''}`} />
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
                    disabled={deletingId === file.id || isDeleting}
                    aria-label="Delete link"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    {deletingId === file.id ? (
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
  )
}
