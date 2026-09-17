'use client';

import AnonUpload from '@/components/icons/AnonUpload';
import { getAnonymousUploadAcceptValue } from '@/services/anonymous-links';
import type { UploadDropzoneProps } from '@/types/components';

export default function UploadDropzone({
  isDragging,
  fileInputRef,
  onFileSelect,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
}: UploadDropzoneProps) {
  return (
    <div
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`group rounded-2xl border border-dashed px-4 py-10 text-center cursor-pointer transition-all duration-200 sm:px-6 sm:py-16 ${
        isDragging ? 'border-accent bg-accent/10 scale-[0.99]' : 'border-border/70 bg-muted/15 hover:bg-muted/30 hover:border-border'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        title="Anonymous upload file input"
        onChange={onFileSelect}
        accept={getAnonymousUploadAcceptValue()}
        className="hidden"
      />
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-background border border-border group-hover:border-accent/40 group-hover:scale-105 transition-all text-muted-foreground group-hover:text-accent sm:h-18 sm:w-18">
        <AnonUpload className="h-13 w-13 sm:h-15 sm:w-15" />
      </div>
      <p className="text-base font-bold text-foreground sm:text-lg">Drag and drop or click to upload</p>
      <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP, and PDF only.</p>
    </div>
  );
}
