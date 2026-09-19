import FilePreview from '@/components/FilePreview';

export default async function AnonymousFilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) return null;

  return <FilePreview fileId={slug} />;
}
