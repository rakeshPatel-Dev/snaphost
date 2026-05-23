import FilePreview from '@/components/FilePreview';

export default async function UserFilePage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { slug } = await params;

  return <FilePreview fileId={slug} />;
}