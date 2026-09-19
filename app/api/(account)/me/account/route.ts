import { NextResponse } from 'next/server';
import { getCurrentAppUser } from '@/lib/server/auth-user';
import { getAuthUserFromRequest } from '@/lib/server/auth-server';
import { deleteFileFromStorage } from '@/lib/server/storage';
import { deleteFileForUser, listFilesForUser } from '@/lib/server/file-admin';
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
    .eq('auth_user_id', authUser.id);

  if (userDeleteError) {
    return NextResponse.json({ error: userDeleteError.message }, { status: 500 });
  }

  try {
    await supabaseAdmin.auth.admin.deleteUser(authUser.id);
  } catch (error) {
    console.error('Supabase auth user deletion failed after local cleanup', error);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
