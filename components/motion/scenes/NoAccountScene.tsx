'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { UserX, ShieldCheck, Clock, Check, AlertTriangle } from 'lucide-react'
import UploadMockTabs from '@/components/sections/upload-mock/UploadMockTabs'
import UploadDropzone from '@/components/sections/upload-mock/UploadDropzone'
import AnonymousLinkCard from '@/components/sections/upload-mock/AnonymousLinkCard'
import { inWindow } from '@/components/motion/usePlayback'
import { getDemoAnonymousLink, demoAnonymousLinkUrl, noop } from './sample'

const tabVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 16, scale: 0.99 }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.28, ease: 'easeOut' as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -16,
    scale: 0.99,
    transition: { duration: 0.2, ease: 'easeOut' as const },
  }),
}

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: 'easeOut' as const },
}

const toastFade = {
  initial: { opacity: 0, y: -6, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.96 },
  transition: { duration: 0.2, ease: 'easeOut' as const },
}

const pad = (n: number) => String(n).padStart(2, '0')

// --- timeline (fractions of t, 0 -> 1) ---
const UPLOAD_END = 0.3 // upload tab -> links tab
const CLICK_END = 0.48 // copy button "pressed" window ends
const COPIED_END = 0.6 // "Link copied" toast clears, full card disappears
const EXPIRE_END = 0.85 // bare-link countdown hits zero

type Phase = 'card' | 'minimal' | 'expired'

export default function NoAccountScene({ t }: { t: number }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const onUploadTab = t < UPLOAD_END

  const [demoLink] = useState(() => getDemoAnonymousLink())

  const copied = inWindow(t, CLICK_END, COPIED_END)

  const phase: Phase = t < COPIED_END ? 'card' : t < EXPIRE_END ? 'minimal' : 'expired'

  const progress = Math.max(0, Math.min(1, (t - COPIED_END) / (EXPIRE_END - COPIED_END)))

  const remaining = Math.max(0, Math.floor(24 * 3600 * (1 - progress)))
  const countdown = `${pad(Math.floor(remaining / 3600))}:${pad(
    Math.floor((remaining % 3600) / 60)
  )}:${pad(remaining % 60)}`

  // Direction: moving from upload -> links is "forward" (slide left),
  // moving links -> upload is "backward" (slide right).
  const direction = onUploadTab ? -1 : 1
  const activeKey = onUploadTab ? 'upload' : `links-${phase}`

  const dropzone = (
    <motion.div
      key="upload-inner"
      {...fade}
      className="flex h-full w-full items-center justify-center"
    >
      <UploadDropzone
        isDragging={false}
        fileInputRef={fileInputRef}
        onFileSelect={noop}
        onDrop={noop}
        onDragOver={noop}
        onDragLeave={noop}
        onClick={noop}
      />
    </motion.div>
  )

  // Phase 1–2: full card, press feedback, then "copied" toast above it
  const cardPhase = (
    <motion.div
      key="card-inner"
      {...fade}
      className="flex h-full w-full items-center justify-center"
    >
      <div className="w-full space-y-3">
        <div className="relative flex h-6 items-center justify-center">
          <AnimatePresence mode="wait">
            {copied && (
              <motion.div
                key="copied-toast"
                {...toastFade}
                className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600"
              >
                <Check className="h-3 w-3" />
                Link copied
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <AnonymousLinkCard
            {...demoLink}
            copied={copied}
            onCopy={noop}
            onOpen={noop}
            onDelete={noop}
          />
        </div>
      </div>
    </motion.div>
  )

  // Phase 3: everything stripped away — just the bare url + expiring bar
  const minimalPhase = (
    <motion.div
      key="minimal-inner"
      {...fade}
      className="flex h-full w-full items-center justify-center"
    >
      <div className="w-full space-y-2">
        <p className="truncate text-center font-mono text-sm text-foreground">
          {demoAnonymousLinkUrl}
        </p>
        <div className="px-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <Clock className="h-3 w-3" />
              Auto-expires in
            </span>
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {countdown}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-500 to-amber-500"
              style={{ width: `${(1 - progress) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )

  // Phase 4: everything gone, centered "Link expired" toast alone
  const expiredPhase = (
    <motion.div
      key="expired-inner"
      {...fade}
      className="flex h-full w-full items-center justify-center"
    >
      <div className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive backdrop-blur">
        <AlertTriangle className="h-4 w-4" />
        Link expired!
      </div>
    </motion.div>
  )

  const linksTab = phase === 'card' ? cardPhase : phase === 'minimal' ? minimalPhase : expiredPhase

  return (
    <div className="relative flex h-90 w-full flex-col">
      <UploadMockTabs
        activeTab={onUploadTab ? 'upload' : 'links'}
        onTabChange={noop}
        linksCount={1}
      />

      <div className="relative flex-1">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={activeKey}
            custom={direction}
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            {onUploadTab ? dropzone : linksTab}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-border/40 bg-muted/20 px-3.5 py-2 text-xs text-muted-foreground">
        {onUploadTab ? (
          <>
            <UserX className="h-3.5 w-3.5 shrink-0" />
            No account. No password. Just upload and go.
          </>
        ) : phase === 'expired' ? (
          <>
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
            Link expired.
          </>
        ) : (
          <>
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            Link created — auto-expires in 24h.
          </>
        )}
      </div>
    </div>
  )
}
