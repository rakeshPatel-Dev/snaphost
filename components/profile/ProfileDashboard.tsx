'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { FileText, FileUp, Globe2, Layers3, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeleteFileMutation, useGetMeUploadQuotaQuery, useUpdateFileMutation } from '@/state/api'
import { getApiErrorMessage } from '@/lib/api-error'
import { copyTextToClipboard } from '@/lib/clipboard'
import { FILE_ERRORS, TOAST_LABELS } from '@/lib/messages'
import type { AppFile } from '@/types/app'
import { CONFIG } from '@/lib/config'
import Container from '@/components/shared/Container'
import AccountInfo from './components/AccountInfo'
import TierBanner from './components/TierBanner'
import LinkCard from './components/LinkCard'
import posthog from 'posthog-js'
import { posthogEnabled } from '@/lib/posthog'
import UploadBox from '@/components/UploadBox'
import BundleCard from './components/BundleCard'

type ProfileDashboardProps = {
  initialUsername: string
  email: string
  tier: 'free' | 'premium'
  files: AppFile[]
  bundles: import('@/types/app').AppBundle[]
}

export default function ProfileDashboard({
  initialUsername,
  email,
  tier,
  files: initialFiles,
  bundles,
}: ProfileDashboardProps) {
  const [files, setFiles] = useState<AppFile[]>(initialFiles)
  const [savedFiles, setSavedFiles] = useState<AppFile[]>(initialFiles)
  const [prevInitialFiles, setPrevInitialFiles] = useState(initialFiles)
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [uploadMode, setUploadMode] = useState<'single' | 'bundle'>('bundle')
  const [updateFile] = useUpdateFileMutation()
  const [deleteFileMutation] = useDeleteFileMutation()
  const { data: uploadQuota } = useGetMeUploadQuotaQuery()

  if (prevInitialFiles !== initialFiles) {
    setPrevInitialFiles(initialFiles)
    setFiles(initialFiles)
    setSavedFiles(initialFiles)
  }

  const isPremium = tier === 'premium'
  const publishedBundles = bundles.filter((b) => b.status === 'published')
  const draftBundles = bundles.filter((b) => b.status === 'draft')
  const totalActiveLinks = files.length + publishedBundles.length
  const planUploadsRemaining = isPremium
    ? null
    : Math.max(0, CONFIG.MAX_ACTIVE_LINKS_FREE - totalActiveLinks)
  const dailyUploadsRemaining = uploadQuota?.remaining ?? null
  const isUploadLimitReached =
    (planUploadsRemaining !== null && planUploadsRemaining === 0) ||
    (dailyUploadsRemaining !== null && dailyUploadsRemaining === 0)
  const uploadLimitMessage =
    planUploadsRemaining === 0
      ? `Your free plan supports up to ${CONFIG.MAX_ACTIVE_LINKS_FREE} active links. Delete an existing link or upgrade to upload more.`
      : 'Your daily upload limit has been reached. Please try again later or upgrade your plan.'

  async function copyLink(url: string) {
    const op = copyTextToClipboard(url).then((copied) => {
      if (!copied) {
        throw new Error('Copy failed')
      }
      if (posthogEnabled) {
        posthog.capture('file_link_copied')
      }
    })

    await toast.promise(op, {
      loading: TOAST_LABELS.copyLink.loading,
      success: TOAST_LABELS.copyLink.success,
      error: FILE_ERRORS.failedToCopyLink,
    })
  }

  async function saveFile(file: AppFile) {
    setEditingFileId(file.id)
    try {
      const op = updateFile({
        fileId: file.id,
        slug: file.slug,
        filename: file.filename,
        expiresAt: file.expires_at,
      })
        .unwrap()
        .then((data) => {
          setFiles((c) => c.map((item) => (item.id === file.id ? data.file : item)))
          setSavedFiles((c) => c.map((item) => (item.id === file.id ? data.file : item)))
          if (posthogEnabled) {
            posthog.capture('file_link_updated', {
              file_type: file.file_type,
              has_expiration: Boolean(file.expires_at),
            })
          }
          return true
        })

      await toast.promise(op, {
        loading: TOAST_LABELS.saveFile.loading,
        success: TOAST_LABELS.saveFile.success,
        error: (err) => getApiErrorMessage(err, FILE_ERRORS.failedToUpdateFile),
      })
    } catch {
    } finally {
      setEditingFileId(null)
    }
  }

  async function deleteFile(fileId: string) {
    setEditingFileId(fileId)
    try {
      const op = deleteFileMutation({ fileId })
        .unwrap()
        .then(() => {
          setFiles((c) => c.filter((item) => item.id !== fileId))
          setSavedFiles((c) => c.filter((item) => item.id !== fileId))
          if (posthogEnabled) {
            posthog.capture('file_link_deleted')
          }
          return true
        })

      await toast.promise(op, {
        loading: TOAST_LABELS.deleteFile.loading,
        success: TOAST_LABELS.deleteFile.success,
        error: (err) => getApiErrorMessage(err, FILE_ERRORS.failedToDeleteFile),
      })
    } catch {
    } finally {
      setEditingFileId(null)
    }
  }

  return (
    <Container className="py-12 sm:py-16">
      <div className="space-y-6">
        <TierBanner isPremium={isPremium} />

        <AccountInfo isPremium={isPremium} username={initialUsername} email={email} tier={tier} />

        <section
          id="profile-upload"
          className="rounded-4xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-xl sm:p-6"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-accent">Workspace</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {uploadMode === 'bundle' ? 'Upload a file bundle' : 'Upload an individual file'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {uploadMode === 'bundle'
                  ? 'Upload multiple files and publish them together under one share link.'
                  : 'Create a managed share link for a single file.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs">
                <Link href="/#dropzone">
                  <Globe2 className="size-3.5" aria-hidden="true" />
                  Upload anonymously
                </Link>
              </Button>
            </div>
          </div>
          <div className="mb-5 inline-flex rounded-full border border-border/60 bg-muted/20 p-1">
            <Button
              type="button"
              size="sm"
              variant={uploadMode === 'single' ? 'secondary' : 'ghost'}
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => setUploadMode('single')}
            >
              <FileUp className="size-3.5" /> Individual file
            </Button>
            <Button
              type="button"
              size="sm"
              variant={uploadMode === 'bundle' ? 'secondary' : 'ghost'}
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => setUploadMode('bundle')}
            >
              <Layers3 className="size-3.5" /> File bundle
            </Button>
          </div>
          <UploadBox
            disabled={isUploadLimitReached}
            disabledMessage={uploadLimitMessage}
            bundleMode={uploadMode === 'bundle'}
            isPremium={isPremium}
          />
        </section>

        <section className="rounded-4xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-xl sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-accent">
                Active Links Overview
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                Link Quota & Breakdown
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Both individual files and published file bundles share your account active-link
                allowance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-border/60 bg-muted/20 px-3 py-1 font-mono text-xs font-semibold text-foreground">
                {totalActiveLinks} / {isPremium ? '∞' : `${CONFIG.MAX_ACTIVE_LINKS_FREE} links`}
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/15 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Individual Files</p>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {files.length} {files.length === 1 ? 'file' : 'files'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/15 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Layers3 className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">File Bundles</p>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {publishedBundles.length} published
                  {draftBundles.length > 0 ? (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      ({draftBundles.length} draft)
                    </span>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/15 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Link2 className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Slots Remaining</p>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {isPremium
                    ? 'Unlimited'
                    : `${planUploadsRemaining} slot${planUploadsRemaining === 1 ? '' : 's'} left`}
                </p>
              </div>
            </div>
          </div>
        </section>

        <LinkCard
          username={initialUsername}
          files={files}
          savedFiles={savedFiles}
          editingFileId={editingFileId}
          setFiles={setFiles}
          onCopyLink={copyLink}
          onSaveFile={saveFile}
          onDeleteFile={deleteFile}
        />
        <BundleCard username={initialUsername} bundles={bundles} />
      </div>
    </Container>
  )
}
