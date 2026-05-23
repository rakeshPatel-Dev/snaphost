import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentAppUser } from '@/lib/clerk-user';
import { listFilesForUser, buildFileUrl } from '@/lib/file-admin';
import ProfileDashboard from '@/components/profile/ProfileDashboard';

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentAppUser(userId);

  if (!user) {
    redirect('/sign-in');
  }

  const files = await listFilesForUser(user.id);

  return (
    <ProfileDashboard
      initialUsername={user.username || ''}
      email={user.email}
      tier={user.tier}
      files={files.map((file) => ({
        id: file.id,
        slug: file.slug,
        filename: file.filename,
        file_type: file.file_type,
        upload_type: file.upload_type,
        expires_at: file.expires_at,
        created_at: file.created_at,
        publicUrl: buildFileUrl(file, user.username),
      }))}
    />
  );
}
