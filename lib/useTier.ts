'use client'

import { useGetMeQuery } from '@/state/api'
import { useAuth } from '@/components/providers/auth-provider'

export function useTier() {
  const { isLoading, isSignedIn } = useAuth()
  const { data } = useGetMeQuery(undefined, { skip: isLoading || !isSignedIn })
  const tier = data?.user?.tier ?? 'free'

  return { tier, isPremium: tier === 'premium' }
}
