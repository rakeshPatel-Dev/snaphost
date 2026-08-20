'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import FilePreview from '@/components/FilePreview';
import { toast } from 'sonner';

export default function FilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const fileId = params.fileId as string;
  const showSuccess = searchParams.get('success') === 'true';

  useEffect(() => {
    if (showSuccess) {
      toast.success('File uploaded! Share this link with others.');
      // Clear the success flag from URL
      window.history.replaceState({}, '', `/f/${fileId}`);
    }
  }, [showSuccess, fileId]);

  if (!fileId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Invalid file ID</p>
      </div>
    );
  }

  return <FilePreview fileId={fileId} />;
}
