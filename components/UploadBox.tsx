'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import UploadForm from './UploadForm';
import UploadSuccessCard from './UploadSuccessCard';

interface UploadSuccess {
  fileId: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  optimizedSize?: number;
}

export default function UploadBox() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<UploadSuccess | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

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
    setError(null);

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/pdf',
    ];

    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Invalid file type. Allowed: PNG, JPG, WEBP, PDF';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      const errorMsg = `File too large. Max: ${maxSize / 1024 / 1024}MB, Got: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.details?.join(', ') || errorData.error || 'Upload failed';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsUploading(false);
        return;
      }

      const data = await response.json();
      const fileUrl = `${window.location.origin}/f/${data.fileId}`;
      
      setUploadSuccess({
        fileId: data.fileId,
        filename: file.name,
        fileUrl: fileUrl,
        fileSize: file.size,
        optimizedSize: data.optimizedSize,
      });
      
      setError(null);
      toast.success('File uploaded successfully!');
      setIsUploading(false);
    } catch (error) {
      const errorMsg = 'Upload failed. Please try again.';
      console.error('Upload error:', error);
      setError(errorMsg);
      toast.error(errorMsg);
      setIsUploading(false);
    }
  };

  const copyLink = () => {
    if (!uploadSuccess) return;
    navigator.clipboard.writeText(uploadSuccess.fileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  const resetUpload = () => {
    setUploadSuccess(null);
    setError(null);
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
