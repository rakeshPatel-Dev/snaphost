'use client'

import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

export function inWindow(t: number, start: number, end: number) {
  return t >= start && t < end
}

export function usePlayback(
  ref: RefObject<HTMLElement | null>,
  {
    duration = 8000,
    enabled = true,
    staticTime = 0.2,
  }: { duration?: number; enabled?: boolean; staticTime?: number } = {}
) {
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const raf = useRef<number | null>(null)
  const start = useRef(0)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPlaying(entry.isIntersecting)
      },
      { rootMargin: '0px 0px -15% 0px' }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [enabled, ref])

  useEffect(() => {
    if (!enabled || !playing) return

    // Start from the same representative frame used by the static mobile
    // fallback, avoiding a visual jump when desktop motion hydrates.
    start.current = performance.now() - staticTime * duration
    let cancelled = false

    const frame = (now: number) => {
      if (cancelled) return
      setElapsed((now - start.current) % duration)
      raf.current = requestAnimationFrame(frame)
    }

    raf.current = requestAnimationFrame(frame)

    return () => {
      cancelled = true
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [enabled, playing, duration, staticTime])

  const t = enabled ? (playing ? elapsed / duration : 0) : staticTime

  const restart = () => {
    start.current = performance.now()
    setElapsed(0)
  }

  return {
    t,
    playing,
    isAnimated: enabled,
    restart,
  }
}
