'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import posthog from 'posthog-js'
import { posthogEnabled } from '@/lib/posthog'
import { supabase } from '@/lib/supabase'

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  isSignedIn: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const identifiedUserId = useRef<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const updateUser = (nextUser: User | null) => {
      if (posthogEnabled) {
        if (!nextUser) {
          if (identifiedUserId.current) {
            posthog.reset()
            identifiedUserId.current = null
          }
        } else if (identifiedUserId.current !== nextUser.id) {
          if (identifiedUserId.current) {
            posthog.reset()
          }

          const name = nextUser.user_metadata.full_name ?? nextUser.user_metadata.name
          const personProperties: { email?: string; name?: string; username?: string } = {}

          if (nextUser.email) personProperties.email = nextUser.email
          if (typeof name === 'string') personProperties.name = name
          if (typeof nextUser.user_metadata.username === 'string') {
            personProperties.username = nextUser.user_metadata.username
          }

          posthog.identify(nextUser.id, personProperties)
          identifiedUserId.current = nextUser.id
        }
      }

      setUser(nextUser)
      setIsLoading(false)
    }

    const loadUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()

        if (mounted) {
          updateUser(data.user ?? null)
        }
      } catch {
        if (mounted) {
          updateUser(null)
        }
      }
    }

    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) {
        return
      }

      // If the user clicked the recovery link, Supabase emits PASSWORD_RECOVERY.
      // Redirect them to the reset page where they can set a new password.
      if (event === 'PASSWORD_RECOVERY') {
        try {
          router.replace('/reset-password')
        } catch (e) {
          // fallback to full navigation if router is unavailable
          console.warn('Redirecting to reset-password failed, falling back to location assign.', e)
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- Deliberate hard fallback when the router is unavailable.
          window.location.href = '/reset-password'
        }
      }

      updateUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [router])

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user ?? null)
    setIsLoading(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isSignedIn: Boolean(user),
      signOut: async () => {
        await supabase.auth.signOut()
      },
      refreshUser,
    }),
    [user, isLoading, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return ctx
}
