'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { snaphostApi } from '@/lib/api';
import { useAppDispatch } from '@/lib/store';

export default function UserSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) {
      return;
    }

    const storageKey = `snaphost-user-sync:${user.id}`;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    sessionStorage.setItem(storageKey, '1');

    const request = dispatch(snaphostApi.endpoints.getMe.initiate());

    request.unwrap().catch(() => {
      sessionStorage.removeItem(storageKey);
    });
  }, [dispatch, isLoaded, isSignedIn, user?.id]);

  return null;
}
