'use client';

import { ArrowRight } from 'lucide-react';
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
      className={`group rounded-xl border border-dashed px-6 py-10 text-center cursor-pointer transition-all duration-200 ${isDragging ? 'border-accent bg-accent/5' : 'border-border bg-muted/20 hover:bg-muted/40'}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        title="Anonymous upload file input"
        onChange={onFileSelect}
        accept={getAnonymousUploadAcceptValue()}
        className="hidden"
      />
      <div className="mx-auto mb-3 flex h-18 w-18 items-center justify-center rounded-full bg-background border border-border group-hover:border-accent/40 group-hover:scale-105 transition-all text-muted-foreground group-hover:text-accent">
        <AnonUpload className="h-15 w-15" />
      </div>
      <p className="text-sm font-semibold text-foreground">Drop a file or click to create an anonymous link</p>
      <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP, and PDF only. Anonymous links expire automatically in 24 hours.</p>
      <span className="mt-3.5 inline-flex items-center gap-1 text-[11px] font-medium text-foreground bg-muted/10 border border-border/10 px-2 py-0.5 rounded-full">
        Try it now <ArrowRight className="h-3 w-3" />
      </span>
    </div>
  );
}
