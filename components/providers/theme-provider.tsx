'use client'

import { useEffect } from 'react'
import type { ThemeProviderProps } from '@/types/components'

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const isDark = e.newValue === 'dark'
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return <>{children}</>
}
