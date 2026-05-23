import FilePreview from '@/components/FilePreview';

export default function AnonymousFilePage({ params }: { params: { slug: string } }) {
  return <FilePreview fileId={params.slug} />;
}
