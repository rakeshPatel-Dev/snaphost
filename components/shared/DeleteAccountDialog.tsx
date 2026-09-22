'use client'

import { toast } from 'sonner'
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog'
import { useDeleteAccountMutation } from '@/state/api'
import type { DeleteAccountDialogProps } from '@/types/components'
import { useAuth } from '@/components/providers/auth-provider'
import { getApiErrorMessage } from '@/lib/api-error'
import { ACCOUNT_ERRORS, TOAST_LABELS } from '@/lib/messages'

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
  const [deleteAccount] = useDeleteAccountMutation()
  const { signOut } = useAuth()

  const handleDelete = async () => {
    const op = deleteAccount()
      .unwrap()
      .then(async () => {
        await signOut()
        window.location.href = redirectUrl
      })

    await toast.promise(op, {
      loading: TOAST_LABELS.deleteAccount.loading,
      success: TOAST_LABELS.deleteAccount.success,
      error: (err) => getApiErrorMessage(err, ACCOUNT_ERRORS.failedToDeleteAccount),
    })
  }

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
  )
}
