'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UploadBox() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
    setError(null); // Clear previous errors

    // Validate file type and size client-side first
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

    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxPdfSize = 10 * 1024 * 1024; // 10MB
    const maxSize = file.type === 'application/pdf' ? maxPdfSize : maxImageSize;

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
      setError(null); // Clear errors on success
      toast.success('File uploaded successfully!');

      // Redirect to file page with success indicator
      router.push(`/f/${data.fileId}?success=true`);
    } catch (error) {
      const errorMsg = 'Upload failed. Please try again.';
      console.error('Upload error:', error);
      setError(errorMsg);
      toast.error(errorMsg);
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/png,image/jpeg,image/webp,.pdf,application/pdf"
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-3">
          <Upload className="w-12 h-12 text-gray-400" />
          <div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {isUploading ? 'Uploading...' : 'Drop file or click to select'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              PNG, JPG, WEBP, PDF (up to 10MB)
            </p>
          </div>
        </div>

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mt-6 w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
