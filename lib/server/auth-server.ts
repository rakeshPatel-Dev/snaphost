import 'server-only';

import { supabaseAdmin } from './supabase-admin';

type AuthUser = {
  id: string;
  email: string;
  usernameHint: string | null;
};

function getBearerTokenFromAuthorization(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const [scheme, token] = value.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

async function getAuthUserByToken(token: string | null): Promise<AuthUser | null> {
  if (!token) {
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user || !data.user.email) {
    return null;
  }

  const metadata = (data.user.user_metadata ?? {}) as Record<string, unknown>;
  const username = metadata.username;

  return {
    id: data.user.id,
    email: data.user.email,
    usernameHint: typeof username === 'string' ? username : null,
  };
}

export async function getAuthUserFromRequest(request: Request): Promise<AuthUser | null> {
  const token = getBearerTokenFromAuthorization(request.headers.get('authorization'));
  return getAuthUserByToken(token);
}
