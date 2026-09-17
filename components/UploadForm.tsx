'use client';

import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UploadFormProps } from '@/types/components';

export default function UploadForm({
  isDragging,
  isUploading,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputClick,
  fileInputRef,
  onFileSelect,
}: UploadFormProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onFileInputClick}
      className={`rounded-4xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
        isDragging
          ? 'border-accent/40 bg-accent/5'
          : 'border-border/60 bg-card/80 backdrop-blur-xl hover:border-border hover:bg-muted/20'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={onFileSelect}
        accept="image/png,image/jpeg,image/webp,.pdf,application/pdf"
        title="Upload file"
        placeholder="Upload file"
        className="hidden"
        disabled={isUploading}
      />

      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          <Upload className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">
            {isUploading ? 'Uploading...' : 'Drop a file or click to select'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            PNG, JPG, WebP, or PDF up to 10 MB
          </p>
        </div>
      </div>

      <Button
        size="lg"
        onClick={onFileInputClick}
        disabled={isUploading}
        className="mt-6 h-11 px-6 w-full cursor-pointer"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Choose file
          </>
        )}
      </Button>
    </div>
  );
}
