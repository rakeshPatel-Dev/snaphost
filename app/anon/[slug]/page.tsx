import FilePreview from '@/components/FilePreview';

export default async function AnonymousFilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Invalid file link</p>
      </div>
    );
  }

  return <FilePreview fileId={slug} />;
}
