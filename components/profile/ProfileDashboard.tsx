'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useDeleteFileMutation, useUpdateFileMutation } from '@/state/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { FILE_ERRORS, TOAST_LABELS } from '@/lib/messages';
import type { AppFile } from '@/types/app';
import { cn } from '@/lib/utils';
import Container from '@/components/shared/Container';
import AccountInfo from './components/AccountInfo';
import TierBanner from './components/TierBanner';
import LinkCard from './components/LinkCard';

type ProfileDashboardProps = {
  initialUsername: string;
  email: string;
  tier: 'free' | 'premium';
  files: AppFile[];
};

export default function ProfileDashboard({
  initialUsername,
  email,
  tier,
  files: initialFiles,
}: ProfileDashboardProps) {
  const [files, setFiles] = useState<AppFile[]>(initialFiles);
  const [savedFiles, setSavedFiles] = useState<AppFile[]>(initialFiles);
  const [prevInitialFiles, setPrevInitialFiles] = useState(initialFiles);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updateFile] = useUpdateFileMutation();
  const [deleteFileMutation] = useDeleteFileMutation();

  if (prevInitialFiles !== initialFiles) {
    setPrevInitialFiles(initialFiles);
    setFiles(initialFiles);
    setSavedFiles(initialFiles);
  }

  const isPremium = tier === 'premium';

  async function copyLink(url: string, id: string) {
    const op = navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });

    await toast.promise(op, {
      loading: TOAST_LABELS.copyLink.loading,
      success: TOAST_LABELS.copyLink.success,
      error: FILE_ERRORS.failedToCopyLink,
    });
  }

  async function saveFile(file: AppFile) {
    setEditingFileId(file.id);
    try {
      const op = updateFile({
        fileId: file.id,
        slug: file.slug,
        filename: file.filename,
        expiresAt: file.expires_at,
      })
        .unwrap()
        .then((data) => {
          setFiles((c) => c.map((item) => (item.id === file.id ? data.file : item)));
          setSavedFiles((c) => c.map((item) => (item.id === file.id ? data.file : item)));
          return true;
        });

      await toast.promise(op, {
        loading: TOAST_LABELS.saveFile.loading,
        success: TOAST_LABELS.saveFile.success,
        error: (err) => getApiErrorMessage(err, FILE_ERRORS.failedToUpdateFile),
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, FILE_ERRORS.failedToUpdateFile));
    } finally {
      setEditingFileId(null);
    }
  }

  async function deleteFile(fileId: string) {
    setEditingFileId(fileId);
    try {
      const op = deleteFileMutation({ fileId })
        .unwrap()
        .then(() => {
          setFiles((c) => c.filter((item) => item.id !== fileId));
          setSavedFiles((c) => c.filter((item) => item.id !== fileId));
          return true;
        });

      await toast.promise(op, {
        loading: TOAST_LABELS.deleteFile.loading,
        success: TOAST_LABELS.deleteFile.success,
        error: (err) => getApiErrorMessage(err, FILE_ERRORS.failedToDeleteFile),
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, FILE_ERRORS.failedToDeleteFile));
    } finally {
      setEditingFileId(null);
    }
  }

  return (
    <Container className="py-12 sm:py-16">
      <div
        className={cn(
          'space-y-6',
          isPremium && 'premium-glow rounded-4xl border border-amber-400/15 bg-amber-400/[0.015] p-4 sm:p-6'
        )}
      >
        <TierBanner isPremium={isPremium} />

        <AccountInfo isPremium={isPremium} username={initialUsername} email={email} tier={tier} />

        <LinkCard
          username={initialUsername}
          files={files}
          savedFiles={savedFiles}
          isPremium={isPremium}
          editingFileId={editingFileId}
          copiedId={copiedId}
          setFiles={setFiles}
          onCopyLink={copyLink}
          onSaveFile={saveFile}
          onDeleteFile={deleteFile}
        />
      </div>
    </Container>
  );
}
