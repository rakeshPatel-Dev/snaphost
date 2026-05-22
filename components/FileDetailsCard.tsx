'use client';

interface FileDetailsCardProps {
  filename: string;
  fileSize: number;
  optimizedSize?: number;
}

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
    <div className="p-4 rounded-lg bg-muted/40 border border-border">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Filename</p>
            <p className="text-sm font-medium text-foreground truncate">
              {filename}
            </p>
          </div>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted-foreground mb-1">File Size</p>
            <p className="text-sm font-medium text-foreground">{fileSizeMB} MB</p>
          </div>
          {optimizedSize && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Optimized</p>
              <p className="text-sm font-medium text-emerald-600">
                {optimization} saved
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
