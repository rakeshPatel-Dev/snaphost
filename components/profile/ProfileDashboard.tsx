'use client';

import { useState, useEffect } from 'react';


import { toast } from 'sonner';
import { useDeleteFileMutation, useUpdateFileMutation } from '@/state/api';
import { getApiErrorMessage } from '@/lib/api-error';
import type { AppFile } from '@/types/app';
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
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updateFile] = useUpdateFileMutation();
  const [deleteFileMutation] = useDeleteFileMutation();

  useEffect(() => {
    setFiles(initialFiles);
    setSavedFiles(initialFiles);
  }, [initialFiles]);

  const isPremium = tier === 'premium';

  async function copyLink(url: string, id: string) {
    const op = navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });

    await toast.promise(op, {
      loading: 'Copying...',
      success: 'Link copied to clipboard',
      error: 'Failed to copy link',
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
        loading: 'Saving changes...',
        success: 'Link updated',
        error: (err) => getApiErrorMessage(err, 'Failed to update file'),
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update file'));
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
        loading: 'Deleting link...',
        success: 'Link deleted',
        error: (err) => getApiErrorMessage(err, 'Failed to delete file'),
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete file'));
    } finally {
      setEditingFileId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">

      <TierBanner isPremium={isPremium} />

      {/* --- Profile Card --- */}
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
  );
} 