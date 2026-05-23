'use client';

import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadFormProps {
  isDragging: boolean;
  isUploading: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileInputClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

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
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/30'
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
        <div className="p-3 rounded-lg bg-primary/10">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">
            {isUploading ? 'Uploading...' : 'Drop file or click to select'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            PNG, JPG, WEBP, PDF (up to 10MB)
          </p>
        </div>
      </div>

      <Button
        onClick={onFileInputClick}
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
  );
}
