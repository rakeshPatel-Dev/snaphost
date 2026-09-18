'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayback } from './usePlayback';

type MotionPreviewProps = {
  children: (t: number) => ReactNode;
  duration?: number;
  className?: string;
};

export default function MotionPreview({ children, duration = 8000, className }: MotionPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { t, restart } = usePlayback(ref, { duration });

  return (
    <div
      ref={ref}
      aria-hidden
className={cn(
          'relative group min-h-[340px] min-w-0 overflow-hidden rounded-4xl border border-border/60 bg-card/80 p-4 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:p-6',
          className
        )}
    >
      {/* Reserved stage: scenes own a fixed height box, so the card size is constant through playback */}
<div className="pointer-events-none flex w-full select-none items-center justify-center py-6 sm:py-8">
          <div className="min-w-0 origin-center scale-[0.9]">{children(t)}</div>
        </div>

      <button
        type="button"
        tabIndex={-1}
        onClick={restart}
        aria-label="Replay animation"
        title="Replay"
        className="pointer-events-auto absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border/60 bg-background/90 text-muted-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:text-foreground focus:outline-none group-hover:opacity-100 focus-visible:opacity-100"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}