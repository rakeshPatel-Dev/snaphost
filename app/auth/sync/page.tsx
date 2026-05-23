import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentAppUser } from '@/lib/clerk-user';

export default async function AuthSyncPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  await getCurrentAppUser(userId);

  redirect('/profile');
}
