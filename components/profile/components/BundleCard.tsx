'use client'

import { useRef, useState } from 'react'
import {
  ChevronDown,
  ExternalLink,
  File,
  FileImage,
  Layers,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Share2,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { AppBundle } from '@/types/app'
import {
  useDeleteBundleFileMutation,
  useDeleteBundleMutation,
  usePublishBundleMutation,
  useReplaceBundleFileMutation,
  useUpdateBundleFileExpirationMutation,
  useUpdateBundleMutation,
  useUploadBundleFileMutation,
} from '@/state/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import ExpirationPicker from '@/components/ExpirationPicker'
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog'
import ShareModal from '@/components/ShareModal'
import { copyTextToClipboard } from '@/lib/clipboard'
import { getApiErrorMessage } from '@/lib/api-error'
import { CONFIG } from '@/lib/config'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type DeleteTarget =
  | { type: 'bundle'; bundle: AppBundle }
  | { type: 'file'; bundle: AppBundle; fileId: string; filename: string }
  | null

export default function BundleCard({
  username,
  bundles,
}: {
  username: string
  bundles: AppBundle[]
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null)
  const [editingExpiration, setEditingExpiration] = useState<string | null>(null)
  const [replacingFileKey, setReplacingFileKey] = useState<string | null>(null)
  const [addingToBundle, setAddingToBundle] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, { name: string; slug: string }>>({})
  const [expirations, setExpirations] = useState<Record<string, string | null>>({})
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)
  const [shareBundle, setShareBundle] = useState<{ url: string; name: string } | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [updateBundle] = useUpdateBundleMutation()
  const [deleteBundle] = useDeleteBundleMutation()
  const [publishBundle] = usePublishBundleMutation()
  const [replaceFile] = useReplaceBundleFileMutation()
  const [updateFileExpiration] = useUpdateBundleFileExpirationMutation()
  const [deleteFile] = useDeleteBundleFileMutation()
  const [uploadFile] = useUploadBundleFileMutation()

  if (bundles.length === 0) return null

  const toggleExpanded = (bundleId: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(bundleId)) next.delete(bundleId)
      else next.add(bundleId)
      return next
    })
  }

  const saveBundle = async (bundle: AppBundle) => {
    const draft = drafts[bundle.id]
    if (!draft) return
    const operation = updateBundle({
      bundleId: bundle.id,
      name: draft.name,
      slug: draft.slug || undefined,
    })
      .unwrap()
      .then(() => {
        setEditingBundleId(null)
        return true
      })
    await toast.promise(operation, {
      loading: 'Saving bundle changes…',
      success: 'Bundle updated',
      error: (error) => getApiErrorMessage(error, 'Could not update bundle'),
    })
  }

  const publish = async (bundle: AppBundle) => {
    await toast.promise(publishBundle(bundle.id).unwrap(), {
      loading: 'Publishing bundle…',
      success: 'Bundle published',
      error: (error) => getApiErrorMessage(error, 'Could not publish bundle'),
    })
  }

  const copyBundleLink = async (url: string) => {
    await toast.promise(
      copyTextToClipboard(url).then((copied) => {
        if (!copied) throw new Error('Copy failed')
        return true
      }),
      {
        loading: 'Copying link…',
        success: 'Link copied',
        error: 'Could not copy link',
      }
    )
  }

  const addFile = async (bundle: AppBundle, file: File) => {
    await toast.promise(
      uploadFile({
        bundleId: bundle.id,
        file,
        expiresAt: expirations[`${bundle.id}:new`] ?? null,
      }).unwrap(),
      {
        loading: 'Adding file…',
        success: 'File added',
        error: (error) => getApiErrorMessage(error, 'Could not add file'),
      }
    )
    setAddingToBundle(null)
  }

  const replace = async (bundle: AppBundle, fileId: string, file: File) => {
    await toast.promise(
      replaceFile({
        bundleId: bundle.id,
        fileId,
        file,
        expiresAt: expirations[`${bundle.id}:${fileId}`] ?? null,
      }).unwrap(),
      {
        loading: 'Replacing file…',
        success: 'File replaced',
        error: (error) => getApiErrorMessage(error, 'Could not replace file'),
      }
    )
    setReplacingFileKey(null)
  }

  const updateExpiration = async (bundle: AppBundle, fileId: string, expiresAt: string | null) => {
    await toast.promise(updateFileExpiration({ bundleId: bundle.id, fileId, expiresAt }).unwrap(), {
      loading: 'Updating expiration…',
      success: 'Expiration updated',
      error: (error) => getApiErrorMessage(error, 'Could not update expiration'),
    })
    setEditingExpiration(null)
  }

  const removeBundle = async (bundle: AppBundle) => {
    await toast.promise(deleteBundle(bundle.id).unwrap(), {
      loading: 'Deleting bundle…',
      success: 'Bundle deleted',
      error: (error) => getApiErrorMessage(error, 'Could not delete bundle'),
    })
  }

  const removeFile = async (bundle: AppBundle, fileId: string) => {
    await toast.promise(deleteFile({ bundleId: bundle.id, fileId }).unwrap(), {
      loading: 'Removing file…',
      success: 'File removed',
      error: (error) => getApiErrorMessage(error, 'Could not remove file'),
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'bundle') await removeBundle(deleteTarget.bundle)
    else await removeFile(deleteTarget.bundle, deleteTarget.fileId)
    setDeleteTarget(null)
  }

  const discardBundleChanges = (bundle: AppBundle) => {
    setDrafts((all) => ({ ...all, [bundle.id]: { name: bundle.name, slug: bundle.slug ?? '' } }))
    setEditingBundleId(null)
  }

  const hasAnyUnsavedChanges = bundles.some((bundle) => {
    const draft = drafts[bundle.id]
    if (!draft) return false
    return draft.name !== bundle.name || draft.slug !== (bundle.slug ?? '')
  })

  return (
    <>
      <ShareModal
        open={shareBundle !== null}
        onOpenChange={(open) => {
          if (!open) setShareBundle(null)
        }}
        fileUrl={shareBundle?.url ?? ''}
        filename={shareBundle?.name ?? ''}
      />
      <section
        className={cn(
          'mt-6 overflow-hidden rounded-4xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-xl',
          hasAnyUnsavedChanges && 'ring-1 ring-accent/30'
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-accent">Collections</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">File Bundles</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Multi-file groups shared under a single link
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/60 bg-muted/20 px-2.5 py-1 font-mono text-xs font-medium text-muted-foreground">
              {bundles.length} {bundles.length === 1 ? 'bundle' : 'bundles'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4">
          {bundles.map((bundle) => {
            const isOpen = expanded.has(bundle.id)
            const isEditing = editingBundleId === bundle.id
            const draft = drafts[bundle.id] ?? { name: bundle.name, slug: bundle.slug ?? '' }
            const hasUnsavedChanges =
              draft.name !== bundle.name || draft.slug !== (bundle.slug ?? '')
            const slugPrefix = `${CONFIG.BASE_URL.replace(/\/+$/, '')}/${encodeURIComponent(username || 'user')}/`

            return (
              <div
                key={bundle.id}
                className={cn(
                  'relative overflow-hidden rounded-2xl border border-border/50 bg-muted/10 px-4 py-4',
                  hasUnsavedChanges && 'border-accent/30 bg-accent/[0.03]'
                )}
              >
                {hasUnsavedChanges && (
                  <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-accent" />
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
                    <Layers className="h-4 w-4" />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-foreground">
                    {bundle.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(bundle.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {isEditing ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label
                        htmlFor={`bundle-name-${bundle.id}`}
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Name
                      </Label>
                      <Input
                        id={`bundle-name-${bundle.id}`}
                        value={draft.name}
                        onChange={(event) =>
                          setDrafts((all) => ({
                            ...all,
                            [bundle.id]: { ...draft, name: event.target.value },
                          }))
                        }
                        className="h-9 rounded-full border-border/60 bg-muted/20 px-4 text-sm"
                        placeholder="Bundle name"
                      />
                    </div>

                    {bundle.status === 'published' && (
                      <div className="grid gap-1.5">
                        <Label
                          htmlFor={`bundle-slug-${bundle.id}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Slug
                        </Label>
                        <div className="flex min-w-0 items-center overflow-hidden rounded-full border border-border/60 bg-muted/20 font-mono text-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                          <span className="max-w-[55%] shrink-0 truncate pl-4 text-muted-foreground/70">
                            {slugPrefix}
                          </span>
                          <Input
                            id={`bundle-slug-${bundle.id}`}
                            value={draft.slug}
                            onChange={(event) =>
                              setDrafts((all) => ({
                                ...all,
                                [bundle.id]: { ...draft, slug: event.target.value },
                              }))
                            }
                            className="h-9 min-w-0 flex-1 rounded-none border-0 bg-transparent px-1.5 font-mono text-sm shadow-none focus-visible:ring-0"
                            placeholder="my-slug"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-border/50 bg-muted/15 px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span
                        className={cn(
                          bundle.status === 'draft' ? 'text-foreground/75' : 'text-accent'
                        )}
                      >
                        {bundle.status === 'draft' ? 'Draft' : 'Published'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {bundle.fileCount} file{bundle.fileCount === 1 ? '' : 's'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{Math.round(bundle.totalSize / 1024)} KB</span>
                    </div>
                    {bundle.publicUrl && (
                      <div className="mt-2 flex min-w-0 items-center gap-2">
                        <Input
                          value={bundle.publicUrl}
                          readOnly
                          title="Click to copy link"
                          aria-label="Public URL. Click to copy link"
                          onClick={() => void copyBundleLink(bundle.publicUrl!)}
                          className="h-9 min-w-0 flex-1 cursor-pointer truncate rounded-full border-border/60 bg-background/70 px-4 font-mono text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:bg-accent/[0.03] focus-visible:ring-0"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 shrink-0 rounded-full"
                          aria-label="Open link"
                          title="Open link"
                          onClick={() =>
                            window.open(bundle.publicUrl!, '_blank', 'noopener,noreferrer')
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {!isEditing && bundle.publicUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 rounded-full bg-background px-3 text-xs hover:bg-muted/50"
                      onClick={() => setShareBundle({ url: bundle.publicUrl!, name: bundle.name })}
                    >
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  )}

                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        className="h-8 gap-1.5 rounded-full px-3 text-xs"
                        onClick={() => void saveBundle(bundle)}
                        disabled={!hasUnsavedChanges}
                      >
                        <Save className="h-4 w-4" />
                        Save changes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 rounded-full bg-background px-3 text-xs hover:bg-muted/50"
                        onClick={() => discardBundleChanges(bundle)}
                      >
                        <X className="size-3.5" />
                        Discard
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 rounded-full bg-background px-3 text-xs hover:bg-muted/50"
                      onClick={() => {
                        setDrafts((all) => ({
                          ...all,
                          [bundle.id]: { name: bundle.name, slug: bundle.slug ?? '' },
                        }))
                        setEditingBundleId(bundle.id)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}

                  {bundle.status === 'draft' && bundle.fileCount > 0 && (
                    <Button
                      size="sm"
                      className="h-8 gap-1.5 rounded-full px-3 text-xs"
                      onClick={() => void publish(bundle)}
                    >
                      Publish
                    </Button>
                  )}

                  <button
                    type="button"
                    className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => toggleExpanded(bundle.id)}
                    aria-expanded={isOpen}
                  >
                    <ChevronDown
                      className={`size-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                    {isOpen ? 'Hide files' : 'Show files'}
                  </button>

                  <DeleteConfirmDialog
                    trigger={
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        disabled={isEditing}
                        aria-label={`Delete ${bundle.name}`}
                        title="Delete bundle"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    title="Delete this bundle?"
                    description={
                      <>
                        <strong>{bundle.name}</strong> and all its files will be permanently
                        removed. Anyone with the link will no longer be able to access it.
                      </>
                    }
                    confirmLabel="Delete bundle"
                    onConfirm={() => setDeleteTarget({ type: 'bundle', bundle })}
                  />
                </div>

                {isOpen && (
                  <div className="mt-4 space-y-2 border-t border-border/50 pt-4">
                    {(bundle.files ?? []).map((file) => {
                      const Icon = file.file_type === 'pdf' ? File : FileImage
                      const fileKey = `${bundle.id}:${file.id}`
                      return (
                        <div key={file.id}>
                          <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/55 px-3 py-2.5">
                            <Icon className="size-4 shrink-0 text-accent" />
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">
                              {file.filename}
                            </span>
                            <span className="hidden text-xs text-muted-foreground sm:block">
                              {file.expires_at
                                ? `Expires ${new Date(file.expires_at).toLocaleDateString()}`
                                : 'Never expires'}
                            </span>
                            <input
                              ref={(element) => {
                                inputRefs.current[fileKey] = element
                              }}
                              type="file"
                              accept="image/png,image/jpeg,image/webp,.pdf"
                              className="hidden"
                              onChange={(event) => {
                                const next = event.currentTarget.files?.[0]
                                if (next) void replace(bundle, file.id, next)
                                event.currentTarget.value = ''
                              }}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  aria-label={`Actions for ${file.filename}`}
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setReplacingFileKey(fileKey)}>
                                  <Upload className="size-4" /> Replace file
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditingExpiration(fileKey)}>
                                  <Pencil className="size-4" /> Change expiration
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: 'file',
                                      bundle,
                                      fileId: file.id,
                                      filename: file.filename,
                                    })
                                  }
                                >
                                  <Trash2 className="size-4" /> Remove file
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {editingExpiration === fileKey && (
                            <div className="ml-9 mt-2 flex items-center justify-between gap-3 rounded-xl bg-muted/30 px-3 py-2">
                              <span className="text-xs text-muted-foreground">New expiration</span>
                              <ExpirationPicker
                                value={expirations[fileKey] ?? file.expires_at}
                                onChange={(value) => {
                                  setExpirations((all) => ({ ...all, [fileKey]: value }))
                                  void updateExpiration(bundle, file.id, value)
                                }}
                                label={`New expiration for ${file.filename}`}
                              />
                            </div>
                          )}
                          {replacingFileKey === fileKey && (
                            <div className="ml-9 mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/30 px-3 py-2">
                              <span className="text-xs text-muted-foreground">
                                New file expiration
                              </span>
                              <div className="flex items-center gap-2">
                                <ExpirationPicker
                                  value={expirations[fileKey] ?? null}
                                  onChange={(value) =>
                                    setExpirations((all) => ({ ...all, [fileKey]: value }))
                                  }
                                  label={`New expiration for replacement of ${file.filename}`}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => inputRefs.current[fileKey]?.click()}
                                >
                                  Choose file
                                </Button>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => setReplacingFileKey(null)}
                                  aria-label="Cancel replacement"
                                >
                                  <X className="size-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {bundle.files?.length === 0 && (
                      <p className="rounded-2xl border border-dashed border-border/60 px-4 py-5 text-center text-sm text-muted-foreground">
                        No active files in this bundle.
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <input
                        ref={(element) => {
                          inputRefs.current[`${bundle.id}:new`] = element
                        }}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,.pdf"
                        className="hidden"
                        onChange={(event) => {
                          const next = event.currentTarget.files?.[0]
                          event.currentTarget.value = ''
                          if (next) void addFile(bundle, next)
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 rounded-full bg-background px-3 text-xs hover:bg-muted/50"
                        onClick={() => setAddingToBundle(bundle.id)}
                      >
                        <Plus className="size-3.5" /> Add file
                      </Button>
                      {addingToBundle === bundle.id && (
                        <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-3 py-1.5">
                          <ExpirationPicker
                            value={expirations[`${bundle.id}:new`] ?? null}
                            onChange={(value) =>
                              setExpirations((all) => ({ ...all, [`${bundle.id}:new`]: value }))
                            }
                            label="New file expiration"
                          />
                          <Button
                            size="sm"
                            onClick={() => inputRefs.current[`${bundle.id}:new`]?.click()}
                          >
                            Choose file
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <DeleteConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
          title={
            deleteTarget?.type === 'bundle'
              ? `Delete ${deleteTarget.bundle.name}?`
              : `Remove ${deleteTarget?.filename ?? 'this file'}?`
          }
          description={
            deleteTarget?.type === 'bundle'
              ? 'This permanently removes the bundle, its files, and its share link.'
              : 'This removes the file from the bundle and deletes its stored copy.'
          }
          onConfirm={confirmDelete}
        />
      </section>
    </>
  )
}
