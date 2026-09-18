'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileImage, Copy, Check, Trash2, Clock, FileText } from 'lucide-react';
import { inWindow } from '@/components/motion/usePlayback';

type DemoFile = {
  id: string;
  name: string;
  date: string;
  expiry: string;
  icon: typeof FileImage;
};

const FILES: DemoFile[] = [
  { id: 'a', name: 'https://snaphost.dev/jane/meeting', date: 'Sep 16', expiry: '24h', icon: FileText },
  { id: 'b', name: 'https://snaphost.dev/jane/notes', date: 'Sep 17', expiry: '30 days', icon: FileText },
  { id: 'c', name: 'https://snaphost.dev/jane/photos', date: 'Sep 18', expiry: 'never', icon: FileImage },
];

const rowVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    x: -20,
    scale: 0.96,
    transition: { duration: 0.22, ease: 'easeOut' as const },
  },
};

const iconVariants = {
  initial: { opacity: 0, scale: 0.6, rotate: -30 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.2, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    scale: 0.6,
    rotate: 30,
    transition: { duration: 0.15, ease: 'easeOut' as const },
  },
};

export default function FileManagerScene({ t }: { t: number }) {
  const rows = useMemo(() => {
    const visible: DemoFile[] = [];
    FILES.forEach((file, i) => {
      if (inWindow(t, 0.08 + i * 0.08, 1)) visible.push(file);
    });
    const removed = inWindow(t, 0.6, 0.95) ? FILES[1] : null;
    return { visible: visible.filter((file) => file.id !== removed?.id) };
  }, [t]);

  const copied = inWindow(t, 0.42, 0.58);

  return (
    <div className="relative flex h-55 w-full flex-col">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold tracking-tight text-foreground">
          Everything you share
        </p>
        <span className="rounded-full border border-border/60 bg-muted/20 px-2.5 py-0.5 font-mono text-xs font-medium text-muted-foreground">
          {rows.visible.length} / 5
        </span>
      </div>

      <div className="mt-3 flex flex-1 items-center">
        <div className="flex w-full flex-col gap-1.5">
          <AnimatePresence initial={false} mode="popLayout">
            {rows.visible.map((file) => {
              const isCopied = copied && file.id === 'a';
              return (
                <motion.div
                  key={file.id}
                  layout
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-2.5 py-1.5"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
                    <file.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold tracking-tight text-foreground">
                      {file.name}
                    </p>
                    <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {file.date} · {file.expiry}
                    </p>
                  </div>
                  <span
                    className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isCopied
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'text-muted-foreground'
                      }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isCopied ? (
                        <motion.span
                          key="check"
                          variants={iconVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="flex items-center justify-center"
                        >
                          <Check className="h-3 w-3" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          variants={iconVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="flex items-center justify-center"
                        >
                          <Copy className="h-3 w-3" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground">
                    <Trash2 className="h-3 w-3" />
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Copy, rename, or delete from anywhere — retention without the cleanup.
      </p>
    </div>
  );
}