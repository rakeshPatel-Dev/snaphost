import { supabaseAdmin } from '@/lib/supabase-admin';
import type { AppUser } from '@/types/app';

type EnsureUserParams = {
  authUserId: string;
  email: string;
  usernameHint?: string | null;
};

function toUsernameBase(input: string | null | undefined) {
  const normalized = (input ?? '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '');
  return normalized.slice(0, 24);
}

function buildUsernameCandidates(base: string, authUserId: string) {
  const safeBase = base.length >= 3 ? base : `user${authUserId.slice(0, 4).toLowerCase()}`;
  const shortId = authUserId.slice(0, 8).toLowerCase().replace(/[^a-z0-9]/g, '');

  return [
    safeBase,
    `${safeBase}-${shortId.slice(0, 4)}`.slice(0, 32),
    `${safeBase}-${shortId.slice(0, 6)}`.slice(0, 32),
    `user-${shortId}`.slice(0, 32),
  ];
}

export async function getCurrentAppUser({ authUserId, email, usernameHint }: EnsureUserParams) {
  const { data: existingUser, error: lookupError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existingUser) {
    if (existingUser.email !== email) {
      await supabaseAdmin.from('users').update({ email }).eq('auth_user_id', authUserId);
    }

    return existingUser as AppUser;
  }

  const fallbackUsernameSource = usernameHint ?? email.split('@')[0] ?? `user-${authUserId.slice(0, 8)}`;
  const usernameCandidates = buildUsernameCandidates(toUsernameBase(fallbackUsernameSource), authUserId);

  let lastError: unknown = null;

  for (const candidate of usernameCandidates) {
    const { data: createdUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authUserId,
        email,
        username: candidate,
        tier: 'free',
      })
      .select('*')
      .single();

    if (!createError && createdUser) {
      return createdUser as AppUser;
    }

    if (createError?.code === '23505') {
      const { data: existingAfterConflict, error: retryError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (retryError) {
        throw retryError;
      }

      if (existingAfterConflict) {
        return existingAfterConflict as AppUser;
      }

      if (createError.message.includes('users_username_key')) {
        lastError = createError;
        continue;
      }
    }

    throw createError;
  }

  throw lastError ?? new Error('Failed to create user record');
}

export async function updateCurrentAppUserUsername(authUserId: string, username: string) {
  const { data: updatedUser, error } = await supabaseAdmin
    .from('users')
    .update({ username })
    .eq('auth_user_id', authUserId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  await supabaseAdmin.auth.admin.updateUserById(authUserId, {
    user_metadata: { username },
  });

  return {
    user: updatedUser as AppUser,
  };
}
