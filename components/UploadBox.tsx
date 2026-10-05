'use client'

import { useRef } from 'react'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'
import UploadForm from './UploadForm'
import UploadSuccessCard from './UploadSuccessCard'
import { validateFile } from '@/lib/fileValidation'
import { getApiErrorMessage } from '@/lib/api-error'
import { UPLOAD_ERRORS, TOAST_LABELS } from '@/lib/messages'
import { useAppDispatch, useAppSelector } from '@/state/store'
import { resetUploadState, setDragging, setError, setSuccess } from '@/state/slices/uploadSlice'
import { useUploadFileMutation } from '@/state/api'
import posthog from 'posthog-js'
import { posthogEnabled } from '@/lib/posthog'

interface UploadBoxProps {
  disabled?: boolean
  disabledMessage?: string
}

export default function UploadBox({ disabled = false, disabledMessage }: UploadBoxProps) {
  const dispatch = useAppDispatch()
  const isDragging = useAppSelector((state) => state.upload.isDragging)
  const error = useAppSelector((state) => state.upload.error)
  const uploadSuccess = useAppSelector((state) => state.upload.success)
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
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
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
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
      />
    </div>
  )
}
