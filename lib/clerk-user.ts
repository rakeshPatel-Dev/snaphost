import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from './supabase-admin';

export type AppUser = {
  id: string;
  clerk_id: string;
  username: string | null;
  email: string;
  tier: 'free' | 'premium';
  created_at: string;
  updated_at: string;
};

export async function getCurrentAppUser(clerkId?: string | null) {
  const signedInUserId = clerkId ?? (await currentUser())?.id ?? null;

  if (!signedInUserId) {
    return null;
  }

  let clerkUser = await currentUser();

  if (!clerkUser || clerkUser.id !== signedInUserId) {
    const clerk = await clerkClient();
    clerkUser = await clerk.users.getUser(signedInUserId);
  }

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    '';

  const { data: existingUser, error: lookupError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_id', signedInUserId)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existingUser) {
    return existingUser as AppUser;
  }

  const fallbackUsername =
    clerkUser.username ??
    clerkUser.firstName?.toLowerCase().replace(/[^a-z0-9]+/g, '') ??
    `user-${signedInUserId.slice(0, 8)}`;

  const { data: createdUser, error: createError } = await supabaseAdmin
    .from('users')
    .insert({
      clerk_id: signedInUserId,
      email,
      username: fallbackUsername,
      tier: 'free',
    })
    .select('*')
    .single();

  if (createError) {
    if (createError.code === '23505') {
      const { data: existingAfterConflict, error: retryError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('clerk_id', signedInUserId)
        .maybeSingle();

      if (retryError) {
        throw retryError;
      }

      if (existingAfterConflict) {
        return existingAfterConflict as AppUser;
      }
    }

    throw createError;
  }

  return createdUser as AppUser;
}

export async function updateCurrentAppUserUsername(clerkId: string, username: string) {
  const { data: updatedClerkUser } = await clerkClient.users.updateUser(clerkId, {
    username,
  });

  const { data: updatedUser, error } = await supabaseAdmin
    .from('users')
    .update({ username })
    .eq('clerk_id', clerkId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return {
    clerkUser: updatedClerkUser,
    user: updatedUser as AppUser,
  };
}
