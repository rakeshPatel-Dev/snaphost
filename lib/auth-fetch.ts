'use client';

import { supabase } from '@/lib/supabase';

export async function fetchWithSupabaseAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error('Your session expired. Please sign in again.');
  }

  const headers = new Headers(init.headers);
  headers.set('authorization', `Bearer ${accessToken}`);

  return fetch(input, {
    ...init,
    headers,
  });
}
