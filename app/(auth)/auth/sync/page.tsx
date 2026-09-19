import { redirect } from 'next/navigation';

export default async function AuthSyncPage() {
  redirect('/profile');
}
