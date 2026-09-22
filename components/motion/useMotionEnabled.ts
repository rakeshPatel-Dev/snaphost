'use client'

import { useEffect, useState } from 'react'

/**
 * Marketing motion is reserved for viewports that have room to make it
 * legible. Small screens receive the same content in its settled state.
 */
export function useMotionEnabled() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(min-width: 640px) and (prefers-reduced-motion: no-preference)'
    )
    const update = () => setEnabled(mediaQuery.matches)

    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return enabled
}
