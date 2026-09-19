'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useMotionEnabled } from './useMotionEnabled';

export default function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const canAnimate = useMotionEnabled();

  if (!canAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ type: 'spring', stiffness: 90, damping: 18, delay }}
    >
      {children}
    </motion.div>
  );
}
