'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadMock } from '../sections/UploadMock';
import { ArrowRight } from 'lucide-react';
import DashedGrid from '@/components/shared/DashedGrid';

export default function Hero() {
  const consoleRef = useRef<HTMLDivElement>(null);

  // Track scroll progress relative to the console container
  const { scrollYProgress } = useScroll({
    target: consoleRef,
    offset: ['start end', 'center center'],
  });

  // Map scroll progress -> scale (starts slightly smaller, grows to full size)
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return (
    <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20 sm:pb-32 border-b border-border/30">
      {/* Background visual effects */}
      <DashedGrid absolute zIndex={-10} opacity={0.4} />

      {/* Glowing ambient background light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-150 bg-radial from-muted/20 via-transparent to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Top Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-start text-left max-w-3xl"
        >
          {/* Announcement Pill */}
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 hover:bg-muted/40 px-3.5 py-1.5 text-xs font-medium text-foreground transition-all mb-8 group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Snaphost 2.0 is live</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
              Upload files fast <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-foreground leading-[1.06]">
            Instant file sharing <br className="hidden sm:inline" />
            <span className="text-foreground/90">for modern workflows</span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            <strong className="font-semibold text-foreground">
              Snaphost offers the fastest rails
            </strong>{' '}
            to move images and PDFs anywhere. Zero sign-up friction, instant short links, and automatic 24-hour expiration.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex items-center gap-3.5 flex-wrap">

            <Button asChild size="lg" className="h-11 px-6 cursor-pointer">
              <Link href="/sign-up">Create account</Link>
            </Button>

            <Button variant="outline" asChild size="lg" className="h-11 px-6 cursor-pointer">
              <a href="#dropzone">Upload anonymously</a>
            </Button>

          
          </div>
        </motion.div>

        {/* Showcase Container: Anonymous Upload Console */}
        <motion.div
          ref={consoleRef}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          id="dropzone"
          className="mt-14 sm:mt-20 w-full scroll-mt-24"
          style={{ willChange: 'transform' }}
        >
          <motion.div
            style={{ scale, opacity, transformOrigin: 'center top' }}
            className="relative rounded-4xl border border-border/80 bg-card/60 backdrop-blur-xl p-3 sm:p-6 ring-1 ring-border/20 shadow-xl shadow-black/5"
          >
            <UploadMock showFloatingFeatures={false} showInlineFeatures={true} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}