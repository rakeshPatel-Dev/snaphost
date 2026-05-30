'use client';

import { useEffect, useMemo, useState } from 'react';

export type UsernameAvailabilityTone = 'neutral' | 'good' | 'warn' | 'bad';

export type UsernameAvailabilityStatus = {
  checking: boolean;
  available: boolean;
  text: string;
  tone: UsernameAvailabilityTone;
};

export type UseUsernameAvailabilityOptions = {
  value: string;
  enabled?: boolean;
  currentUsername?: string;
  debounceMs?: number;
};

const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_\-]{1,30}[a-z0-9])?$/;

const DEFAULT_STATUS: UsernameAvailabilityStatus = {
  checking: false,
  available: false,
  text: 'Choose a username for your public profile.',
  tone: 'neutral',
};

const INVALID_STATUS: UsernameAvailabilityStatus = {
  checking: false,
  available: false,
  text: 'Use 3–32 lowercase letters, numbers, underscores, or hyphens.',
  tone: 'bad',
};

const SELF_STATUS: UsernameAvailabilityStatus = {
  checking: false,
  available: true,
  text: 'This is your current username.',
  tone: 'good',
};

export function useUsernameAvailability({
  value,
  enabled = true,
  currentUsername,
  debounceMs = 350,
}: UseUsernameAvailabilityOptions) {
  const normalizedUsername = useMemo(() => value.trim().toLowerCase(), [value]);
  const normalizedCurrentUsername = useMemo(() => currentUsername?.trim().toLowerCase() ?? '', [currentUsername]);
  const [status, setStatus] = useState<UsernameAvailabilityStatus>(DEFAULT_STATUS);

  useEffect(() => {
    if (!enabled) {
      setStatus(DEFAULT_STATUS);
      return;
    }

    if (!normalizedUsername) {
      setStatus(DEFAULT_STATUS);
      return;
    }

    if (normalizedCurrentUsername && normalizedUsername === normalizedCurrentUsername) {
      setStatus(SELF_STATUS);
      return;
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 32 || !USERNAME_PATTERN.test(normalizedUsername)) {
      setStatus(INVALID_STATUS);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setStatus((previous) => ({ ...previous, checking: true }));

      try {
        const response = await fetch(`/api/username/availability?username=${encodeURIComponent(normalizedUsername)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Request failed');
        }

        const payload = (await response.json()) as {
          username: string;
          available: boolean;
          valid: boolean;
          message?: string;
        };

        if (!payload.valid) {
          setStatus({
            checking: false,
            available: false,
            text: payload.message ?? 'Invalid username format.',
            tone: 'bad',
          });
          return;
        }

        setStatus({
          checking: false,
          available: payload.available,
          text: payload.available ? `@${payload.username} is available.` : `@${payload.username} is already taken.`,
          tone: payload.available ? 'good' : 'bad',
        });
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setStatus({
          checking: false,
          available: false,
          text: 'Could not check username right now. Try again.',
          tone: 'bad',
        });
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [debounceMs, enabled, normalizedCurrentUsername, normalizedUsername]);

  return {
    normalizedUsername,
    status,
    isChecking: status.checking,
    isAvailable: status.available,
  };
}
