'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Clock,
  ExternalLink,
  File,
  FileImage,
  Pencil,
  Save,
  Share2,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog'
import ShareModal from '@/components/ShareModal'
import type { AppFile } from '@/types/app'
import { buildPublicFileUrl } from '@/lib/public-file-url'
import { CONFIG } from '@/lib/config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ExpirationPreset = '1d' | '7d' | '1m' | 'never'

function getExpirationPreset(expiresAt: string | null): ExpirationPreset {
  if (!expiresAt) return 'never'
  const expiresAtTime = new Date(expiresAt).getTime()
  const diffMs = expiresAtTime - Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  if (diffMs <= oneDayMs * 2) return '1d'
  if (diffMs <= oneDayMs * 10) return '7d'
  return '1m'
}

function getExpiresAtFromPreset(preset: ExpirationPreset): string | null {
  if (preset === 'never') return null
  const nextDate = new Date()
  if (preset === '1d') nextDate.setDate(nextDate.getDate() + 1)
  else if (preset === '7d') nextDate.setDate(nextDate.getDate() + 7)
  else nextDate.setMonth(nextDate.getMonth() + 1)
  return nextDate.toISOString()
}

type LinkCardProps = {
  username: string
  files: AppFile[]
  savedFiles: AppFile[]
  isPremium: boolean
  editingFileId: string | null
  setFiles: React.Dispatch<React.SetStateAction<AppFile[]>>
  onCopyLink: (url: string) => void
  onSaveFile: (file: AppFile) => Promise<void>
  onDeleteFile: (fileId: string) => void
}

const LinkCard = ({
  username,
  files,
  savedFiles,
  isPremium,
  editingFileId,
  setFiles,
  onCopyLink,
  onSaveFile,
  onDeleteFile,
}: LinkCardProps) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [shareFile, setShareFile] = useState<{ url: string; filename: string } | null>(null)
  const hasFileChanges = (file: AppFile, savedFile?: AppFile) => {
    if (!savedFile) return false
    const savedPreset = getExpirationPreset(savedFile.expires_at)
    const currentPreset = getExpirationPreset(file.expires_at)
    return (
      savedFile.filename !== file.filename ||
      savedFile.slug !== file.slug ||
      savedPreset !== currentPreset
    )
  }

  const hasAnyUnsavedChanges = files.some((file) => {
    const savedFile = savedFiles.find((f) => f.id === file.id)
    return hasFileChanges(file, savedFile)
  })

  return (
    <>
      <ShareModal
        open={shareFile !== null}
        onOpenChange={(open) => {
          if (!open) setShareFile(null)
        }}
        fileUrl={shareFile?.url ?? ''}
        filename={shareFile?.filename ?? ''}
      />
      <section
        className={cn(
          'rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-sm',
          hasAnyUnsavedChanges && 'ring-1 ring-accent/30'
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-4">
          <h2 className="text-lg font-semibold tracking-tight">Your links</h2>
          <div className="flex flex-wrap items-center gap-3">
            {files.length > 0 && (
              <span className="rounded-full border border-border/60 bg-muted/20 px-2.5 py-1 font-mono text-xs font-medium text-muted-foreground">
                {files.length} / {isPremium ? '∞' : '5'}
              </span>
            )}
          </div>
        </div>

        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
            <p className="text-sm font-medium tracking-tight text-foreground">No uploads yet.</p>
            <Button asChild size="lg">
              <Link href="#profile-upload">
                <Zap className="h-4 w-4" />
                Upload a file
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {files.map((file) => {
              const isEditing = editingId === file.id
              const isSaving = editingFileId === file.id
              const FileIcon = file.file_type === 'pdf' ? File : FileImage

              const resolvedPublicUrl = buildPublicFileUrl({
                baseUrl: CONFIG.BASE_URL,
                slug: file.slug,
                username,
                uploadType: file.upload_type,
              })
              const slugPrefix =
                file.upload_type === 'anonymous'
                  ? `${CONFIG.BASE_URL.replace(/\/+$/, '')}/anon/`
                  : `${CONFIG.BASE_URL.replace(/\/+$/, '')}/${encodeURIComponent(username || 'user')}/`
              const expirationPreset = getExpirationPreset(file.expires_at)
              const isNeverExpiring = expirationPreset === 'never'

              function setExpirationPreset(preset: ExpirationPreset) {
                const nextExpiration = getExpiresAtFromPreset(preset)
                setFiles((currentFiles) =>
                  currentFiles.map((item) =>
                    item.id === file.id ? { ...item, expires_at: nextExpiration } : item
                  )
                )
              }

              const savedFile = savedFiles.find((f) => f.id === file.id)
              const isModified = hasFileChanges(file, savedFile)

              function cancelChanges() {
                if (savedFile) {
                  setFiles((currentFiles) =>
                    currentFiles.map((item) =>
                      item.id === file.id
                        ? {
                            ...item,
                            filename: savedFile.filename,
                            slug: savedFile.slug,
                            expires_at: savedFile.expires_at,
                          }
                        : item
                    )
                  )
                }
                setEditingId(null)
              }

              async function saveChanges() {
                await onSaveFile(file)
                setEditingId(null)
              }

              return (
                <div
                  key={file.id}
                  className={cn('relative px-4 py-4 sm:px-5', isModified && 'bg-accent/[0.03]')}
                >
                  {isModified && (
                    <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-accent" />
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
                      <FileIcon className="h-4 w-4" />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-foreground">
                      {file.filename}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(file.created_at).toLocaleDateString(undefined, {
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
                          htmlFor={`filename-${file.id}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Filename
                        </Label>
                        <Input
                          id={`filename-${file.id}`}
                          value={file.filename}
                          onChange={(e) =>
                            setFiles((currentFiles) =>
                              currentFiles.map((item) =>
                                item.id === file.id ? { ...item, filename: e.target.value } : item
                              )
                            )
                          }
                          className="h-9 rounded-full border-border/60 bg-muted/20 px-4 text-sm"
                          placeholder="Filename"
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label
                          htmlFor={`slug-${file.id}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Slug
                        </Label>
                        <div className="flex min-w-0 items-center overflow-hidden rounded-full border border-border/60 bg-muted/20 font-mono text-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                          <span className="max-w-[55%] shrink-0 truncate pl-4 text-muted-foreground/70">
                            {slugPrefix}
                          </span>
                          <Input
                            id={`slug-${file.id}`}
                            value={file.slug}
                            onChange={(e) =>
                              setFiles((currentFiles) =>
                                currentFiles.map((item) =>
                                  item.id === file.id ? { ...item, slug: e.target.value } : item
                                )
                              )
                            }
                            className="h-9 min-w-0 flex-1 rounded-none border-0 bg-transparent px-1.5 font-mono text-sm shadow-none focus-visible:ring-0"
                            placeholder="my-slug"
                          />
                        </div>
                      </div>

                      <div className="grid gap-1.5 sm:col-span-2">
                        <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          Expiration
                        </Label>
                        <Select
                          value={expirationPreset}
                          onValueChange={(value) => setExpirationPreset(value as ExpirationPreset)}
                        >
                          <SelectTrigger
                            className={cn(
                              'h-9 w-full justify-between rounded-full border-border/60 bg-muted/20 px-4 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                              isNeverExpiring && 'font-medium text-accent'
                            )}
                          >
                            <SelectValue placeholder="Select expiration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1d">1 day</SelectItem>
                            <SelectItem value="7d">7 days</SelectItem>
                            <SelectItem value="1m">1 month</SelectItem>
                            <SelectItem value="never" className="font-medium text-accent">
                              Never
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-2xl border border-border/50 bg-muted/15 px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span
                          className={cn(isNeverExpiring ? 'text-accent' : 'text-foreground/75')}
                        >
                          {isNeverExpiring
                            ? 'Never expires'
                            : `Expires ${new Date(file.expires_at ?? '').toLocaleDateString(
                                undefined,
                                {
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}`}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{file.file_type.toUpperCase()}</span>
                      </div>
                      <div className="mt-2 flex min-w-0 items-center gap-2">
                        <Input
                          value={resolvedPublicUrl}
                          readOnly
                          title="Click to copy link"
                          aria-label="Public URL. Click to copy link"
                          onClick={() => onCopyLink(resolvedPublicUrl)}
                          className="h-9 min-w-0 flex-1 cursor-pointer truncate rounded-full border-border/60 bg-background/70 px-4 font-mono text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:bg-accent/[0.03] focus-visible:ring-0"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 shrink-0 rounded-full"
                          aria-label="Open link"
                          title="Open link"
                          onClick={() =>
                            window.open(resolvedPublicUrl, '_blank', 'noopener,noreferrer')
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {!isEditing && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className={cn(
                            'h-8 gap-1.5 rounded-full bg-background px-3 text-xs hover:bg-muted/50'
                          )}
                          onClick={() =>
                            setShareFile({ url: resolvedPublicUrl, filename: file.filename })
                          }
                        >
                          <Share2 className="h-4 w-4" /> Share
                        </Button>
                      </>
                    )}

                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          className="h-8 gap-1.5 rounded-full px-3 text-xs"
                          onClick={() => void saveChanges()}
                          disabled={isSaving || !isModified}
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? 'Saving…' : 'Save changes'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 rounded-full bg-background px-3 text-xs hover:bg-muted/50"
                          onClick={cancelChanges}
                          disabled={isSaving}
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
                        onClick={() => setEditingId(file.id)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    )}

                    <div className="ml-auto">
                      <DeleteConfirmDialog
                        trigger={
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            disabled={isEditing}
                            aria-label={`Delete ${file.filename}`}
                            title="Delete link"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                        title="Delete this link?"
                        description={
                          <>
                            <strong>{file.filename}</strong> will be permanently removed. Anyone
                            with the link will no longer be able to access it.
                          </>
                        }
                        confirmLabel="Delete link"
                        onConfirm={() => onDeleteFile(file.id)}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}

export default LinkCard
