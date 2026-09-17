'use client';
import type { FileDetailsCardProps } from '@/types/components';

export default function FileDetailsCard({
  filename,
  fileSize,
  optimizedSize,
}: FileDetailsCardProps) {
  const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
  const optimization = optimizedSize
    ? `${((1 - optimizedSize / fileSize) * 100).toFixed(1)}%`
    : 'pending';

  return (
    <div className="rounded-2xl bg-muted/20 border border-border/60 p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1">Filename</p>
            <p className="text-sm font-medium text-foreground truncate">
              {filename}
            </p>
          </div>
        </div>
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">File size</p>
            <p className="text-sm font-medium text-foreground">{fileSizeMB} MB</p>
          </div>
          {optimizedSize && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Optimized</p>
              <p className="text-sm font-medium text-accent">
                {optimization} saved
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
