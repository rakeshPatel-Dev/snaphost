'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadMock } from '../sections/UploadMock';
import { ArrowRight } from 'lucide-react';
import DashedGrid from '@/components/shared/DashedGrid';
import AnnouncementPill from './AnnouncementPill';

export default function Hero() {
  const consoleRef = useRef<HTMLDivElement>(null);

  // Detect viewport >= sm (640px). Scale effect only runs on desktop.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: consoleRef,
    offset: ['start end', 'center center'],
  });

  // Always define the transform (hooks must be unconditional),
  // then ignore its value on mobile via a derived transform.
  const scaleRaw = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const scale = useTransform(scaleRaw, (v) => (isDesktop ? v : 1));

  return (
    <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20 sm:pb-32 border-b border-border/30">
      <DashedGrid absolute zIndex={-10} opacity={0.4} />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-150 bg-radial from-muted/20 via-transparent to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-start text-left max-w-3xl"
        >
          <AnnouncementPill/>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-foreground leading-[1.06]">
            Instant file sharing <br className="hidden sm:inline" />
            <span className="text-foreground/90">for modern workflows</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            <strong className="font-semibold text-foreground">
              Snaphost offers the fastest rails
            </strong>{' '}
            to move images and PDFs anywhere. Zero sign-up friction, instant short links, and automatic 24-hour expiration.
          </p>

          <div className="mt-8 flex items-center gap-3.5 flex-wrap">
            <Button asChild size="lg" className="h-11 px-6 cursor-pointer">
              <Link href="/sign-up">Create account</Link>
            </Button>

            <Button variant="outline" asChild size="lg" className="h-11 px-6 cursor-pointer">
              <a href="#dropzone">Upload anonymously</a>
            </Button>
          </div>
        </motion.div>

        {/* Showcase Container */}
        <motion.div
          ref={consoleRef}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          id="dropzone"
          // Full-bleed only on sm+ ; on mobile stay inside parent padding
          className="mt-14 sm:mt-20 scroll-mt-24 sm:w-[calc(100%+6rem)] sm:-mx-10"
          style={{ willChange: 'transform' }}
        >
          <motion.div
            style={{ scale, transformOrigin: 'center top' }}
            className="relative rounded-4xl border border-border/80 bg-card/60 backdrop-blur-xl p-3 sm:p-6 ring-1 ring-border/20 shadow-xl shadow-black/5"
          >
            <UploadMock showFloatingFeatures={false} showInlineFeatures={true} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}