'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
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
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()

        if (mounted) {
          setUser(data.user ?? null)
          setIsLoading(false)
        }
      } catch {
        if (mounted) {
          setUser(null)
          setIsLoading(false)
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

      setUser(session?.user ?? null)
      setIsLoading(false)
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
