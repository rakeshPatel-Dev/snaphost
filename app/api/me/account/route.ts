import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getCurrentAppUser } from '@/lib/clerk-user';
import { deleteFileFromStorage } from '@/lib/storage';
import { deleteFileForUser, listFilesForUser } from '@/lib/file-admin';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getCurrentAppUser(userId);

  if (!user) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const files = await listFilesForUser(user.id);

  for (const file of files) {
    const deleted = await deleteFileFromStorage(file.storage_path);

    if (!deleted) {
      return NextResponse.json(
        { error: `Failed to delete storage for ${file.filename}` },
        { status: 500 }
      );
    }

    await deleteFileForUser(file.id, user.id);
  }

  const { error: userDeleteError } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('clerk_id', userId);

  if (userDeleteError) {
    return NextResponse.json({ error: userDeleteError.message }, { status: 500 });
  }

  const clerk = await clerkClient();
  await clerk.users.deleteUser(userId);

  return NextResponse.json({ success: true }, { status: 200 });
}