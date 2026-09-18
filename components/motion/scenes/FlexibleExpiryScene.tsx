'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { inWindow } from '@/components/motion/usePlayback';

const PRESETS = [
  { label: '1 day', countdown: 'in 24h' },
  { label: '7 days', countdown: 'in 7d' },
  { label: '30 days', countdown: 'in 30d' },
  { label: 'Never', countdown: 'stays live' },
] as const;

const WINDOWS = [
  [0.12, 0.3],
  [0.3, 0.48],
  [0.48, 0.66],
  [0.66, 1],
] as const;

const countdownVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 12, scale: 0.98 }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.24, ease: 'easeOut' as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -12,
    scale: 0.98,
    transition: { duration: 0.18, ease: 'easeOut' as const },
  }),
};

export default function FlexibleExpiryScene({ t }: { t: number }) {
  const activeIndex = Math.max(
    0,
    WINDOWS.findIndex(([start, end]) => inWindow(t, start, end))
  );
  const active = PRESETS[activeIndex];

  // Track direction by comparing with the previous index across renders.
  // A ref-free approach: derive direction from the window boundaries.
  // Since presets advance forward in the timeline, direction is always +1
  // while scrubbing forward, and -1 when scrubbing back.
  const direction = 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10">
          <Clock className="h-4 w-4 text-amber-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-foreground">
            Flexible expiration
          </p>
          <p className="text-xs text-muted-foreground">Keep links for as long as you need.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-muted/20 p-3">
        {PRESETS.map((preset, i) => {
          const isActive = i === activeIndex;
          return (
            <motion.span
              key={preset.label}
              animate={isActive ? { opacity: 1 } : { opacity: 0.55 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className={`relative flex h-8 min-w-14 items-center justify-center rounded-full px-3 text-xs font-semibold ${isActive
                  ? 'text-background'
                  : 'text-muted-foreground border border-border/60'
                }`}
            >
              {isActive && (
                <motion.span
                  layoutId="preset-pill-bg"
                  className="absolute inset-0 rounded-full bg-foreground"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10">{preset.label}</span>
            </motion.span>
          );
        })}
      </div>

      <div className="flex items-center justify-between rounded-full border border-border/40 bg-muted/20 px-3.5 py-2 text-xs">
        <span className="text-muted-foreground">Link availability</span>
        <div className="relative flex h-5 min-w-16 items-center justify-end overflow-hidden">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.span
              key={active.label}
              custom={direction}
              variants={countdownVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="block font-mono font-semibold tabular-nums text-foreground"
            >
              {active.countdown}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Anonymous uploads default to 24h expiration.
      </p>
    </div>
  );
}