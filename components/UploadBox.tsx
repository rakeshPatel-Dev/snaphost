'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Crown, Upload } from 'lucide-react'
import { Button } from './ui/button'
import ExpirationPicker from './ExpirationPicker'
import UploadForm from './UploadForm'
import UploadSuccessCard from './UploadSuccessCard'
import { validateFile } from '@/lib/fileValidation'
import { getApiErrorMessage } from '@/lib/api-error'
import { UPLOAD_ERRORS, TOAST_LABELS } from '@/lib/messages'
import { useAppDispatch, useAppSelector } from '@/state/store'
import { resetUploadState, setDragging, setError, setSuccess } from '@/state/slices/uploadSlice'
import {
  useCreateBundleMutation,
  useDeleteBundleMutation,
  usePublishBundleMutation,
  useUploadBundleFileMutation,
  useUploadFileMutation,
} from '@/state/api'
import posthog from 'posthog-js'
import { posthogEnabled } from '@/lib/posthog'

interface UploadBoxProps {
  disabled?: boolean
  disabledMessage?: string
  bundleMode?: boolean
  isPremium?: boolean
}

function getPendingFileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

export default function UploadBox({
  disabled = false,
  disabledMessage,
  bundleMode = false,
  isPremium = false,
}: UploadBoxProps) {
  const dispatch = useAppDispatch()
  const isDragging = useAppSelector((state) => state.upload.isDragging)
  const error = useAppSelector((state) => state.upload.error)
  const uploadSuccess = useAppSelector((state) => state.upload.success)
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
  const [createBundle] = useCreateBundleMutation()
  const [deleteBundle] = useDeleteBundleMutation()
  const [uploadBundleFile] = useUploadBundleFileMutation()
  const [publishBundle, { isLoading: isPublishing }] = usePublishBundleMutation()
  const [bundle, setBundle] = useState<{
    id: string
    name: string
    uploaded: number
    total: number
    url: string | null
  } | null>(null)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [pendingExpirations, setPendingExpirations] = useState<Record<string, string | null>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return
    e.preventDefault()
    dispatch(setDragging(true))
  }

  const handleDragLeave = () => {
    dispatch(setDragging(false))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return
    e.preventDefault()
    dispatch(setDragging(false))

    const files = e.dataTransfer.files
    if (files.length > 0) {
      if (bundleMode) void handleBundleUpload(Array.from(files))
      else void handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      if (bundleMode) void handleBundleUpload(Array.from(files))
      else void handleFileUpload(files[0])
    }
    e.currentTarget.value = ''
  }

  const handleBundleUpload = async (files: File[]) => {
    if (disabled || files.length === 0) return
    dispatch(setError(null))
    const validFiles = files.filter((file) => validateFile(file).valid)
    if (validFiles.length === 0) {
      const message = 'Select PNG, JPG, WebP, or PDF files up to 10 MB.'
      dispatch(setError(message))
      toast.error(message)
      return
    }
    setPendingFiles((current) => {
      const existing = new Set(current.map(getPendingFileKey))
      return [...current, ...validFiles.filter((file) => !existing.has(getPendingFileKey(file)))]
    })
  }

  const startBundleUpload = async () => {
    if (pendingFiles.length === 0) return
    try {
      const created = bundle
        ? null
        : await createBundle({
            name: pendingFiles[0].name.replace(/\.[^.]+$/, ''),
          }).unwrap()
      const targetBundle = bundle ?? created!.bundle
      if (!bundle) {
        setBundle({
          id: targetBundle.id,
          name: targetBundle.name,
          uploaded: 0,
          total: pendingFiles.length,
          url: created?.bundle.publicUrl ?? null,
        })
      } else {
        setBundle((current) =>
          current ? { ...current, total: current.total + pendingFiles.length } : current
        )
      }
      const filesToUpload = pendingFiles
      setPendingFiles([])
      const failedFiles: File[] = []
      const failedExpirations: Record<string, string | null> = {}
      for (const file of filesToUpload) {
        const expiration = pendingExpirations[getPendingFileKey(file)]
        try {
          await uploadBundleFile({
            bundleId: targetBundle.id,
            file,
            expiresAt:
              expiration &&
              !Number.isNaN(new Date(expiration).getTime()) &&
              new Date(expiration).getTime() > Date.now()
                ? new Date(expiration).toISOString()
                : null,
          }).unwrap()
          setBundle((current) =>
            current ? { ...current, uploaded: current.uploaded + 1 } : current
          )
        } catch {
          failedFiles.push(file)
          if (expiration) failedExpirations[getPendingFileKey(file)] = expiration
        }
      }
      setPendingFiles(failedFiles)
      setPendingExpirations(failedExpirations)
      setBundle((current) => (current ? { ...current, total: current.uploaded } : current))
      if (failedFiles.length === filesToUpload.length && !bundle) {
        await deleteBundle(targetBundle.id).unwrap()
        setBundle(null)
      }
      if (failedFiles.length > 0) {
        toast.error(
          `${failedFiles.length} file${failedFiles.length === 1 ? '' : 's'} failed. Retry or remove them.`
        )
      } else {
        toast.success('Files uploaded. Publish the bundle when ready.')
      }
    } catch (error) {
      const message = getApiErrorMessage(error, UPLOAD_ERRORS.uploadFailed)
      dispatch(setError(message))
      toast.error(message)
    }
  }

  const handlePublishBundle = async () => {
    if (!bundle) return
    const operation = publishBundle(bundle.id)
      .unwrap()
      .then((result) => {
        setBundle((current) => (current ? { ...current, url: result.bundle.publicUrl } : current))
        return true
      })
    await toast.promise(operation, {
      loading: 'Publishing bundle…',
      success: 'Bundle published',
      error: (error) => getApiErrorMessage(error, 'Could not publish bundle'),
    })
  }

  const handleFileUpload = async (file: File) => {
    if (disabled) return
    dispatch(setError(null))

    const validation = validateFile(file)
    if (!validation.valid) {
      const errorMsg = validation.errors.map((item) => item.message).join(', ')
      dispatch(setError(errorMsg))
      toast.error(errorMsg)
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      const op = uploadFile(formData)
        .unwrap()
        .then((data) => {
          const fileUrl = data.url || `${window.location.origin}/anon/${data.fileId}`

          dispatch(
            setSuccess({
              fileId: data.fileId,
              filename: file.name,
              fileUrl,
              fileSize: file.size,
              optimizedSize: data.optimizedSize,
            })
          )

          if (posthogEnabled) {
            posthog.capture('file_uploaded', {
              file_type: file.type === 'application/pdf' ? 'pdf' : 'image',
              file_size_bytes: file.size,
              optimized: Boolean(data.optimizedSize),
            })
          }

          return true
        })

      await toast.promise(op, {
        loading: TOAST_LABELS.upload.loading,
        success: TOAST_LABELS.upload.success,
        error: (err) => getApiErrorMessage(err, UPLOAD_ERRORS.uploadFailed),
      })
    } catch (error) {
      const errorMsg = getApiErrorMessage(error, UPLOAD_ERRORS.uploadFailed)
      console.error('Upload error:', error)
      dispatch(setError(errorMsg))
    }
  }

  const resetUpload = () => {
    dispatch(resetUploadState())
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setBundle(null)
    setPendingFiles([])
    setPendingExpirations({})
  }

  if (uploadSuccess) {
    return (
      <UploadSuccessCard
        fileId={uploadSuccess.fileId}
        filename={uploadSuccess.filename}
        fileUrl={uploadSuccess.fileUrl}
        fileSize={uploadSuccess.fileSize}
        optimizedSize={uploadSuccess.optimizedSize}
        onUploadMore={resetUpload}
      />
    )
  }

  if (disabled) {
    return (
      <div className="rounded-4xl border border-border/60 bg-muted/20 p-8 text-center sm:p-10">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Upload className="size-5" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">Uploads are paused</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {disabledMessage ?? 'You have reached the upload limit for your plan.'}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {isPremium && (
        <div className="mb-4 flex items-center gap-1.5 text-xs text-[var(--premium)]">
          <Crown className="h-3.5 w-3.5" />
          Unlimited uploads
        </div>
      )}
      {bundle && (
        <div className="mb-4 rounded-3xl border border-border/60 bg-card/80 p-5">
          <p className="font-semibold">{bundle.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {bundle.uploaded} of {bundle.total} files uploaded
          </p>
          {bundle.url ? (
            <a
              className="mt-3 block truncate text-sm font-medium text-accent hover:underline"
              href={bundle.url}
            >
              {bundle.url}
            </a>
          ) : (
            <Button
              className="mt-4"
              disabled={bundle.uploaded === 0 || bundle.uploaded < bundle.total || isPublishing}
              onClick={() => void handlePublishBundle()}
            >
              {isPublishing ? 'Publishing…' : 'Publish bundle'}
            </Button>
          )}
        </div>
      )}
      {pendingFiles.length > 0 && (
        <div className="mb-4 rounded-3xl border border-border/60 bg-card/80 p-5">
          <p className="font-semibold">Set file expiration</p>
          <div className="mt-3 space-y-2">
            {pendingFiles.map((file) => (
              <div
                key={getPendingFileKey(file)}
                className="flex flex-wrap items-center gap-3 rounded-2xl bg-muted/20 px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                <ExpirationPicker
                  value={pendingExpirations[getPendingFileKey(file)] ?? null}
                  onChange={(value) =>
                    setPendingExpirations((current) => ({
                      ...current,
                      [getPendingFileKey(file)]: value,
                    }))
                  }
                  label={`Expiration for ${file.name}`}
                />
              </div>
            ))}
          </div>
          <Button className="mt-4" onClick={() => void startBundleUpload()}>
            {bundle ? 'Add files to bundle' : 'Upload bundle'}
          </Button>
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}
      <UploadForm
        isDragging={isDragging}
        isUploading={isUploading}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileInputClick={() => fileInputRef.current?.click()}
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
        multiple={bundleMode}
      />
    </div>
  )
}
