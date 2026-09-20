import type { Metadata } from 'next';
import FilePreview from '@/components/FilePreview';
import { getFilePageMetadata } from '@/lib/file-page-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return getFilePageMetadata(slug);
}

export default async function UserFilePage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { slug } = await params;

  return <FilePreview fileId={slug} />;
}
