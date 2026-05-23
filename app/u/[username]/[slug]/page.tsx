import FilePreview from '@/components/FilePreview';

export default function UserFilePage({ params }: { params: { username: string; slug: string } }) {
  return <FilePreview fileId={params.slug} />;
}
