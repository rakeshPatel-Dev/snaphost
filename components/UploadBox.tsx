'use client';

import { useRef } from 'react';
import { toast } from 'sonner';
import UploadForm from './UploadForm';
import UploadSuccessCard from './UploadSuccessCard';
import { validateFile } from '@/lib/fileValidation';
import { getApiErrorMessage } from '@/lib/api-error';
import { UPLOAD_ERRORS, TOAST_LABELS } from '@/lib/messages';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { resetUploadState, setDragging, setError, setSuccess } from '@/state/slices/uploadSlice';
import { useUploadFileMutation } from '@/state/api';

export default function UploadBox() {
  const dispatch = useAppDispatch();
  const isDragging = useAppSelector((state) => state.upload.isDragging);
  const error = useAppSelector((state) => state.upload.error);
  const uploadSuccess = useAppSelector((state) => state.upload.success);
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dispatch(setDragging(true));
  };

  const handleDragLeave = () => {
    dispatch(setDragging(false));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dispatch(setDragging(false));

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    dispatch(setError(null));

    const validation = validateFile(file);
    if (!validation.valid) {
      const errorMsg = validation.errors.map((item) => item.message).join(', ');
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const op = uploadFile(formData)
        .unwrap()
        .then((data) => {
          const fileUrl = data.url || `${window.location.origin}/anon/${data.fileId}`;

          dispatch(
            setSuccess({
              fileId: data.fileId,
              filename: file.name,
              fileUrl,
              fileSize: file.size,
              optimizedSize: data.optimizedSize,
            })
          );

          return true;
        });

      await toast.promise(op, {
        loading: TOAST_LABELS.upload.loading,
        success: TOAST_LABELS.upload.success,
        error: (err) => getApiErrorMessage(err, UPLOAD_ERRORS.uploadFailed),
      });
    } catch (error) {
      const errorMsg = getApiErrorMessage(error, UPLOAD_ERRORS.uploadFailed);
      console.error('Upload error:', error);
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    }
  };

  const resetUpload = () => {
    dispatch(resetUploadState());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Success State
  if (uploadSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <UploadSuccessCard
          fileId={uploadSuccess.fileId}
          filename={uploadSuccess.filename}
          fileUrl={uploadSuccess.fileUrl}
          fileSize={uploadSuccess.fileSize}
          optimizedSize={uploadSuccess.optimizedSize}
          onUploadMore={resetUpload}
        />
      </div>
    );
  }

  // Upload State
  return (
    <div className="w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
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
  );
}
