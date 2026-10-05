'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Globe2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeleteFileMutation, useGetMeUploadQuotaQuery, useUpdateFileMutation } from '@/state/api'
import { getApiErrorMessage } from '@/lib/api-error'
import { copyTextToClipboard } from '@/lib/clipboard'
import { FILE_ERRORS, TOAST_LABELS } from '@/lib/messages'
import type { AppFile } from '@/types/app'
import { cn } from '@/lib/utils'
import Container from '@/components/shared/Container'
import AccountInfo from './components/AccountInfo'
import TierBanner from './components/TierBanner'
import LinkCard from './components/LinkCard'
import posthog from 'posthog-js'
import { posthogEnabled } from '@/lib/posthog'
import UploadBox from '@/components/UploadBox'

type ProfileDashboardProps = {
  initialUsername: string
  email: string
  tier: 'free' | 'premium'
  files: AppFile[]
}

export default function ProfileDashboard({
  initialUsername,
  email,
  tier,
  files: initialFiles,
}: ProfileDashboardProps) {
  const [files, setFiles] = useState<AppFile[]>(initialFiles)
  const [savedFiles, setSavedFiles] = useState<AppFile[]>(initialFiles)
  const [prevInitialFiles, setPrevInitialFiles] = useState(initialFiles)
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [updateFile] = useUpdateFileMutation()
  const [deleteFileMutation] = useDeleteFileMutation()
  const { data: uploadQuota } = useGetMeUploadQuotaQuery()

  if (prevInitialFiles !== initialFiles) {
    setPrevInitialFiles(initialFiles)
    setFiles(initialFiles)
    setSavedFiles(initialFiles)
  }

  const isPremium = tier === 'premium'
  const planUploadsRemaining = isPremium ? null : Math.max(0, 5 - files.length)
  const dailyUploadsRemaining = uploadQuota?.remaining ?? null
  const isUploadLimitReached =
    (planUploadsRemaining !== null && planUploadsRemaining === 0) ||
    (dailyUploadsRemaining !== null && dailyUploadsRemaining === 0)
  const uploadLimitMessage =
    planUploadsRemaining === 0
      ? 'Your free plan supports up to 5 active links. Delete an existing link or upgrade to upload more.'
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
      <div
        className={cn(
          'space-y-6',
          isPremium &&
            'premium-glow rounded-4xl border border-amber-400/15 bg-amber-400/[0.015] p-4 sm:p-6'
        )}
      >
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
                Upload a file
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a managed share link for your account.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs">
                <Link href="/#dropzone">
                  <Globe2 className="size-3.5" aria-hidden="true" />
                  Upload anonymously
                </Link>
              </Button>
              <span className="rounded-full border border-border/60 bg-muted/20 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {isPremium ? 'Premium uploads' : `${planUploadsRemaining} plan slots left`}
              </span>
            </div>
          </div>
          <UploadBox disabled={isUploadLimitReached} disabledMessage={uploadLimitMessage} />
        </section>

        <LinkCard
          username={initialUsername}
          files={files}
          savedFiles={savedFiles}
          isPremium={isPremium}
          editingFileId={editingFileId}
          setFiles={setFiles}
          onCopyLink={copyLink}
          onSaveFile={saveFile}
          onDeleteFile={deleteFile}
        />
      </div>
    </Container>
  )
}
