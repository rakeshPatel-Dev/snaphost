import { NextResponse } from 'next/server';
import { getCurrentAppUser } from '@/lib/server/auth-user';
import { getAuthUserFromRequest } from '@/lib/server/auth-server';
import { deleteFileFromStorage } from '@/lib/server/storage';
import { listActiveFilesForUser } from '@/lib/server/file-admin';
import { supabaseAdmin } from '@/lib/server/supabase-admin';

export async function DELETE(request: Request) {
  const authUser = await getAuthUserFromRequest(request);

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getCurrentAppUser({
    authUserId: authUser.id,
    email: authUser.email,
    usernameHint: authUser.usernameHint,
  });

  if (!user) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Capture active storage paths before removing the Auth identity, whose foreign-key
  // cascade deletes the application user and all related file records.
  const files = await listActiveFilesForUser(user.id);

  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id);
  if (authDeleteError) {
    console.error('Supabase auth user deletion failed', authDeleteError);
    return NextResponse.json({ error: 'Unable to delete your account. Please try again.' }, { status: 500 });
  }

  // Storage has no transaction with Postgres; best-effort cleanup cannot undo an
  // already-complete account deletion, so failed removals are logged for follow-up.
  const storageResults = await Promise.allSettled(
    files.map(({ storage_path }) => deleteFileFromStorage(storage_path))
  );
  const failedStorageDeletes = storageResults.filter(
    (result) => result.status === 'rejected' || !result.value
  );

  if (failedStorageDeletes.length > 0) {
    console.error('Account deleted with orphaned storage objects', {
      authUserId: authUser.id,
      failedStorageDeletes: failedStorageDeletes.length,
    });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
