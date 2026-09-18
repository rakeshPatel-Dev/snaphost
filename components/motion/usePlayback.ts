'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export function inWindow(t: number, start: number, end: number) {
  return t >= start && t < end;
}

export function usePlayback(
  ref: RefObject<HTMLElement | null>,
  { duration = 8000 }: { duration?: number } = {}
) {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPlaying(entry.isIntersecting);
      },
      { rootMargin: '0px 0px -15% 0px' }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    if (!playing) return;

    if (reducedMotion) {
      return;
    }

    start.current = performance.now();
    let cancelled = false;

    const frame = (now: number) => {
      if (cancelled) return;
      setElapsed((now - start.current) % duration);
      raf.current = requestAnimationFrame(frame);
    };

    raf.current = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, duration, reducedMotion]);

  const t = playing 
   ? reducedMotion 
    ? 1 - Number.EPSILON 
    : elapsed / duration 
   : 0;

  const restart = () => {
    start.current = performance.now();
    setElapsed(0);
  };

  return {
    t,
    playing,
    restart,
  };
}