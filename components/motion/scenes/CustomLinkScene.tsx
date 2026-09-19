'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User, Pencil, Check } from 'lucide-react';
import { inWindow } from '@/components/motion/usePlayback';
import { reveal } from './sample';
import { SITE_URL } from '@/data/emails';

const USERNAME = 'jane';
const NEW_PART = 'resume';
const OLD_SLUG = '4Xk9Q2';

const slugVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 10, scale: 0.98 }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.26, ease: 'easeOut' as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -10,
    scale: 0.98,
    transition: { duration: 0.18, ease: 'easeOut' as const },
  }),
};

export default function CustomLinkScene({ t }: { t: number }) {
  const typed = reveal(OLD_SLUG, t, 0.15, 0.35);
  const customized = t >= 0.4;
  const morphing = inWindow(t, 0.4, 0.8);
  const newSlug = customized ? reveal(NEW_PART, t, 0.48, 0.78) : '';
  const saving = inWindow(t, 0.8, 1);

  // Slide direction: new slug enters from the right, old slug exits to the left.
  const direction = customized ? 1 : -1;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
          <User className="h-4 w-4 text-accent" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-foreground">Custom link</p>
          <p className="text-xs text-muted-foreground">Make your links memorable.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Slug</p>
        <div className="flex h-5 items-center gap-1 overflow-hidden font-mono text-xs">
          {/* domain now keeps its natural width so the slug sits right after it */}
          <span className="shrink-0 whitespace-nowrap text-muted-foreground">
            {SITE_URL}/{USERNAME}/
          </span>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            {customized ? (
              // Once customization starts, this is the only slug shown —
              // it persists through morphing AND the save phase (no more reverting to the old slug).
              <motion.span
                key="new"
                custom={direction}
                variants={slugVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className={`shrink-0 rounded px-1 py-0.5 font-semibold ${morphing ? 'bg-accent/10 text-accent' : 'bg-muted/60 text-foreground'
                  }`}
              >
                {newSlug}
                {morphing && <span className="motion-safe:animate-pulse text-accent">|</span>}
              </motion.span>
            ) : (
              typed && (
                <motion.span
                  key="old"
                  custom={direction}
                  variants={slugVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="shrink-0 rounded bg-muted/60 px-1 py-0.5 font-semibold text-foreground"
                >
                  {typed}
                  <span className="motion-safe:animate-pulse text-accent">|</span>
                </motion.span>
              )
            )}
          </AnimatePresence>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/40 pt-3">
          <div className="flex min-w-0 flex-1 gap-1.5 overflow-hidden whitespace-nowrap">
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
              Username path
            </span>
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
              Memorable slug
            </span>
          </div>
          <div className="h-[22px] shrink-0">
            <AnimatePresence mode="wait" initial={false}>
              {saving && (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0, scale: 0.9, y: -2 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -2 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600"
                >
                  <Check className="h-3 w-3" />
                  Saved
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-full border border-border/40 bg-muted/20 px-3.5 py-2">
        <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-wrap text-xs text-muted-foreground">
          Signed-in users pick the path:{' '}
          <span className="font-mono font-medium text-foreground">/{NEW_PART}</span> instead of a
          random /<span className="font-mono font-medium text-foreground">{OLD_SLUG}</span>.
        </span>
      </div>
    </div>
  );
}
