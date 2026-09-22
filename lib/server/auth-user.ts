import 'server-only'

import { supabaseAdmin } from './supabase-admin'
import type { AppUser } from '@/types/app'

type EnsureUserParams = {
  authUserId: string
  email: string
  usernameHint?: string | null
}

// Short-TTL in-memory cache keyed by authUserId so bursty API calls
// (each route handler calls getCurrentAppUser) don't hammer the DB.
const USER_CACHE_TTL_MS = 30_000
const USER_CACHE_MAX_ENTRIES = 500
const userCache = new Map<string, { expiresAt: number; user: AppUser }>()

function getCachedAppUser(authUserId: string): AppUser | null {
  const entry = userCache.get(authUserId)
  if (!entry) {
    return null
  }

  if (entry.expiresAt <= Date.now()) {
    userCache.delete(authUserId)
    return null
  }

  return entry.user
}

function setCachedAppUser(user: AppUser) {
  if (userCache.size >= USER_CACHE_MAX_ENTRIES) {
    const now = Date.now()
    for (const [key, entry] of userCache) {
      if (entry.expiresAt <= now) {
        userCache.delete(key)
      }
    }
    if (userCache.size >= USER_CACHE_MAX_ENTRIES) {
      userCache.clear()
    }
  }

  userCache.set(user.auth_user_id, {
    expiresAt: Date.now() + USER_CACHE_TTL_MS,
    user,
  })
}

/** Drop a cached user row after a profile write. */
export function invalidateAppUserCache(authUserId: string) {
  userCache.delete(authUserId)
}

function toUsernameBase(input: string | null | undefined) {
  const normalized = (input ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '')
  return normalized.slice(0, 24)
}

function buildUsernameCandidates(base: string, authUserId: string) {
  const safeBase = base.length >= 3 ? base : `user${authUserId.slice(0, 4).toLowerCase()}`
  const shortId = authUserId
    .slice(0, 8)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

  return [
    safeBase,
    `${safeBase}-${shortId.slice(0, 4)}`.slice(0, 32),
    `${safeBase}-${shortId.slice(0, 6)}`.slice(0, 32),
    `user-${shortId}`.slice(0, 32),
  ]
}

export async function getCurrentAppUser({ authUserId, email, usernameHint }: EnsureUserParams) {
  const cached = getCachedAppUser(authUserId)
  if (cached) {
    return cached
  }

  const user = await ensureAppUser({ authUserId, email, usernameHint })
  setCachedAppUser(user)
  return user
}

async function ensureAppUser({ authUserId, email, usernameHint }: EnsureUserParams) {
  const { data: existingUser, error: lookupError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (lookupError) {
    throw lookupError
  }

  if (existingUser) {
    if (existingUser.email !== email) {
      await supabaseAdmin.from('users').update({ email }).eq('auth_user_id', authUserId)
      return { ...existingUser, email } as AppUser
    }

    return existingUser as AppUser
  }

  const fallbackUsernameSource =
    usernameHint ?? email.split('@')[0] ?? `user-${authUserId.slice(0, 8)}`
  const usernameCandidates = buildUsernameCandidates(
    toUsernameBase(fallbackUsernameSource),
    authUserId
  )

  let lastError: unknown = null

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
      .single()

    if (!createError && createdUser) {
      return createdUser as AppUser
    }

    if (createError?.code === '23505') {
      const { data: existingAfterConflict, error: retryError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle()

      if (retryError) {
        throw retryError
      }

      if (existingAfterConflict) {
        return existingAfterConflict as AppUser
      }

      if (createError.message.includes('users_username_key')) {
        lastError = createError
        continue
      }
    }

    throw createError
  }

  throw lastError ?? new Error('Failed to create user record')
}

export async function updateCurrentAppUserUsername(authUserId: string, username: string) {
  const { data: updatedUser, error } = await supabaseAdmin
    .from('users')
    .update({ username })
    .eq('auth_user_id', authUserId)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  try {
    await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      user_metadata: { username },
    })
  } catch (metadataError) {
    console.error('Failed to sync username to user_metadata', authUserId, metadataError)
  }

  invalidateAppUserCache(authUserId)

  return {
    user: updatedUser as AppUser,
  }
}
