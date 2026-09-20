'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import FilePreview from '@/components/FilePreview';

export default function FilePageClient({ fileId, showSuccess }: { fileId: string; showSuccess: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!showSuccess) return;

    toast.success('File uploaded! Share this link with others.');
    router.replace(`/f/${fileId}`);
  }, [fileId, router, showSuccess]);

  return <FilePreview fileId={fileId} />;
}
