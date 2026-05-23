'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function UserSync() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) {
      return;
    }

    const storageKey = `snaphost-user-sync:${user.id}`;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    sessionStorage.setItem(storageKey, '1');

    fetch('/api/me').catch(() => {
      sessionStorage.removeItem(storageKey);
    });
  }, [isLoaded, isSignedIn, user?.id]);

  return null;
}
