import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCurrentAppUser } from '@/lib/clerk-user';
import { listFilesForUser, buildFileUrl } from '@/lib/file-admin';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getCurrentAppUser(userId);

  if (!user) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const files = await listFilesForUser(user.id);

  return NextResponse.json(
    {
      files: files.map((file) => ({
        ...file,
        publicUrl: buildFileUrl(file, user.username),
      })),
    },
    { status: 200 }
  );
}
