'use client';

import { toast } from 'sonner';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { useDeleteAccountMutation } from '@/state/api';
import type { DeleteAccountDialogProps } from '@/types/components';
import { useAuth } from '@/components/providers/auth-provider';

export default function DeleteAccountDialog({
  trigger,
  redirectUrl = '/',
  title = 'Delete account?',
  description = 'This will permanently delete your account and all uploaded links. This action cannot be undone.',
  confirmLabel = 'Yes, delete everything',
  destructiveClassName = 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const [deleteAccount] = useDeleteAccountMutation();
  const { signOut } = useAuth();

  const handleDelete = async () => {
    const op = deleteAccount()
      .unwrap()
      .then(async () => {
        await signOut();
        window.location.href = redirectUrl;
      });

    await toast.promise(op, {
      loading: 'Deleting account...',
      success: 'Account deleted',
      error: (err) => (err instanceof Error ? err.message : 'Failed to delete account'),
    });
  };

  return (
    <DeleteConfirmDialog
      trigger={trigger}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      destructiveClassName={destructiveClassName}
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleDelete}
    />
  );
}
