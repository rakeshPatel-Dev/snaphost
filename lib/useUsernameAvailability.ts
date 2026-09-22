'use client'

import { useEffect, useMemo, useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'
import { useGetUsernameAvailabilityQuery } from '@/state/api'

type UsernameAvailabilityTone = 'neutral' | 'good' | 'warn' | 'bad'

type UsernameAvailabilityStatus = {
  checking: boolean
  available: boolean
  text: string
  tone: UsernameAvailabilityTone
}

type UseUsernameAvailabilityOptions = {
  value: string
  enabled?: boolean
  currentUsername?: string
  debounceMs?: number
}

const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_\-]{1,30}[a-z0-9])?$/

const DEFAULT_STATUS: UsernameAvailabilityStatus = {
  checking: false,
  available: false,
  text: 'Choose a username for your public profile.',
  tone: 'neutral',
}

const INVALID_STATUS: UsernameAvailabilityStatus = {
  checking: false,
  available: false,
  text: 'Use 3–32 lowercase letters, numbers, underscores, or hyphens.',
  tone: 'bad',
}

const SELF_STATUS: UsernameAvailabilityStatus = {
  checking: false,
  available: true,
  text: 'This is your current username.',
  tone: 'good',
}

export function useUsernameAvailability({
  value,
  enabled = true,
  currentUsername,
  debounceMs = 350,
}: UseUsernameAvailabilityOptions) {
  const normalizedUsername = useMemo(() => value.trim().toLowerCase(), [value])
  const normalizedCurrentUsername = useMemo(
    () => currentUsername?.trim().toLowerCase() ?? '',
    [currentUsername]
  )
  const [debouncedUsername, setDebouncedUsername] = useState('')

  useEffect(() => {
    if (!enabled || !normalizedUsername) {
      return
    }

    if (normalizedCurrentUsername && normalizedUsername === normalizedCurrentUsername) {
      return
    }

    if (
      normalizedUsername.length < 3 ||
      normalizedUsername.length > 32 ||
      !USERNAME_PATTERN.test(normalizedUsername)
    ) {
      return
    }

    const timeout = window.setTimeout(async () => {
      setDebouncedUsername(normalizedUsername)
    }, debounceMs)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [debounceMs, enabled, normalizedCurrentUsername, normalizedUsername])

  const shouldCheckAvailability =
    enabled &&
    Boolean(normalizedUsername) &&
    normalizedUsername.length >= 3 &&
    normalizedUsername.length <= 32 &&
    USERNAME_PATTERN.test(normalizedUsername) &&
    (!normalizedCurrentUsername || normalizedUsername !== normalizedCurrentUsername)

  const queryArg =
    shouldCheckAvailability && debouncedUsername === normalizedUsername
      ? normalizedUsername
      : skipToken

  const { data, error, isFetching, isLoading } = useGetUsernameAvailabilityQuery(queryArg, {
    refetchOnMountOrArgChange: false,
  })

  const status = useMemo<UsernameAvailabilityStatus>(() => {
    if (!enabled) {
      return DEFAULT_STATUS
    }

    if (!normalizedUsername) {
      return DEFAULT_STATUS
    }

    if (normalizedCurrentUsername && normalizedUsername === normalizedCurrentUsername) {
      return SELF_STATUS
    }

    if (
      normalizedUsername.length < 3 ||
      normalizedUsername.length > 32 ||
      !USERNAME_PATTERN.test(normalizedUsername)
    ) {
      return INVALID_STATUS
    }

    if (debouncedUsername !== normalizedUsername || isLoading || isFetching) {
      return {
        checking: true,
        available: false,
        text: 'Checking availability...',
        tone: 'neutral',
      }
    }

    if (error) {
      return {
        checking: false,
        available: false,
        text: 'Could not check username right now. Try again.',
        tone: 'bad',
      }
    }

    if (!data) {
      return DEFAULT_STATUS
    }

    if (!data.valid) {
      return {
        checking: false,
        available: false,
        text: data.message ?? 'Invalid username format.',
        tone: 'bad',
      }
    }

    return {
      checking: false,
      available: data.available,
      text: data.available
        ? `@${data.username} is available.`
        : `@${data.username} is already taken.`,
      tone: data.available ? 'good' : 'bad',
    }
  }, [
    data,
    debouncedUsername,
    enabled,
    error,
    isFetching,
    isLoading,
    normalizedCurrentUsername,
    normalizedUsername,
  ])

  return {
    normalizedUsername,
    status,
    isChecking: status.checking,
    isAvailable: status.available,
  }
}
