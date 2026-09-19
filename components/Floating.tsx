'use client';

import { useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { GripVertical } from 'lucide-react';

export default function FloatingBadge() {
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      ref={constraintsRef}
    >
      <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
        <motion.div
          drag
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          dragConstraints={constraintsRef}
          className="pointer-events-auto"
          style={{ touchAction: 'none' }}
        >
          <div className="group flex items-center rounded-full border border-border/60 bg-card/80 backdrop-blur-xl p-1 pr-4 text-xs font-medium text-foreground shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] transition-all hover:bg-card/95 hover:border-border/80">
            <div
              className="cursor-grab active:cursor-grabbing p-1.5 rounded-full hover:bg-muted/30 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground flex items-center justify-center mr-1"
              onPointerDown={(e) => dragControls.start(e)}
              title="Drag to move"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 outline-none"
            >
              <span className="relative flex items-center justify-center h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 sm:motion-safe:animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Uploaded to Snaphost</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
