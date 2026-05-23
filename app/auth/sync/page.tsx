import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function AuthSyncPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  redirect('/profile');
}
