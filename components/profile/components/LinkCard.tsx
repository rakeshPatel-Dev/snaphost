'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  File,
  FileImage,
  Save,
  Share2,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog'
import type { AppFile } from '@/types/app'
import { buildPublicFileUrl } from '@/lib/public-file-url'
import { copyTextToClipboard } from '@/lib/clipboard'
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
  uploadsRemaining: number | null
  editingFileId: string | null
  copiedId: string | null
  setFiles: React.Dispatch<React.SetStateAction<AppFile[]>>
  onCopyLink: (url: string, id: string) => void
  onSaveFile: (file: AppFile) => void
  onDeleteFile: (fileId: string) => void
}

const LinkCard = ({
  username,
  files,
  savedFiles,
  isPremium,
  uploadsRemaining,
  editingFileId,
  copiedId,
  setFiles,
  onCopyLink,
  onSaveFile,
  onDeleteFile,
}: LinkCardProps) => {
  const [sharedId, setSharedId] = useState<string | null>(null)

  const handleShare = async (url: string, id: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ url })
      } catch {
        // user dismissed – do nothing
        return
      }
    } else {
      const copied = await copyTextToClipboard(url)
      if (!copied) {
        return
      }
    }
    setSharedId(id)
    setTimeout(() => setSharedId(null), 2000)
  }
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
          {uploadsRemaining !== null && (
            <span
              className={cn(
                'text-xs font-medium',
                uploadsRemaining > 0 ? 'text-muted-foreground' : 'text-destructive'
              )}
            >
              {uploadsRemaining > 0
                ? `${uploadsRemaining} upload${uploadsRemaining === 1 ? '' : 's'} left today`
                : 'Daily upload limit reached'}
            </span>
          )}
          <Button asChild size="sm" className="h-8 gap-1.5 rounded-full px-3 text-xs">
            <Link href="/upload" className="flex items-center gap-1.5">
              <Upload className="h-4 w-4" />
              Upload more
            </Link>
          </Button>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
          <p className="text-sm font-medium tracking-tight text-foreground">No uploads yet.</p>
          <Button asChild size="lg">
            <Link href="/upload">
              <Zap className="h-4 w-4" />
              Upload a file
            </Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {files.map((file) => {
            const isEditing = editingFileId === file.id
            const isCopied = copiedId === file.id
            const FileIcon = file.file_type === 'pdf' ? File : FileImage

            const resolvedPublicUrl = buildPublicFileUrl({
              baseUrl: CONFIG.BASE_URL,
              slug: file.slug,
              username,
              uploadType: file.upload_type,
            })
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
                  {file.upload_type ? (
                    <span className="shrink-0 rounded-full border border-border/60 bg-muted/20 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {file.upload_type}
                    </span>
                  ) : null}
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(file.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                      className="h-9 rounded-full border-border/60 bg-muted/20 px-4 font-mono text-sm"
                      placeholder="my-slug"
                    />
                  </div>

                  <div className="grid gap-1.5">
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

                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Public URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={resolvedPublicUrl}
                        readOnly
                        className="h-9 min-w-0 flex-1 cursor-text truncate rounded-full border-border/60 bg-muted/20 px-4 font-mono text-xs text-muted-foreground focus-visible:ring-0"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 shrink-0 rounded-full"
                        aria-label="Open link"
                        onClick={() =>
                          window.open(resolvedPublicUrl, '_blank', 'noopener,noreferrer')
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      'h-8 gap-1.5 rounded-full px-3 text-xs',
                      isCopied
                        ? 'border-accent/20 bg-accent/10 text-accent hover:bg-accent/15'
                        : 'bg-background hover:bg-muted/50'
                    )}
                    onClick={() => onCopyLink(resolvedPublicUrl, file.id)}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy link
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      'h-8 gap-1.5 rounded-full px-3 text-xs',
                      sharedId === file.id
                        ? 'border-accent/20 bg-accent/10 text-accent hover:bg-accent/15'
                        : 'bg-background hover:bg-muted/50'
                    )}
                    onClick={() => handleShare(resolvedPublicUrl, file.id)}
                  >
                    {sharedId === file.id ? (
                      <>
                        <Check className="h-4 w-4" /> Shared
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4" /> Share
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    className="h-8 gap-1.5 rounded-full px-3 text-xs"
                    onClick={() => onSaveFile(file)}
                    disabled={isEditing}
                  >
                    <Save className="h-4 w-4" />
                    {isEditing ? 'Saving…' : 'Save'}
                  </Button>

                  <div className="ml-auto">
                    <DeleteConfirmDialog
                      trigger={
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          disabled={isEditing}
                          aria-label={`Delete ${file.filename}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      }
                      title="Delete this link?"
                      description={
                        <>
                          <strong>{file.filename}</strong> will be permanently removed. Anyone with
                          the link will no longer be able to access it.
                        </>
                      }
                      confirmLabel="Delete link"
                      destructiveClassName="bg-red-600 text-white hover:bg-red-700"
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
  )
}

export default LinkCard
