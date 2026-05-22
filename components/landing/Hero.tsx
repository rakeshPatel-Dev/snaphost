'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UploadMock } from '../sections/UploadMock';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 border-b border-border/20">
      {/* Background visual effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 -z-10" />
      
      {/* Glowing decorative circles */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-accent/10 to-purple-500/10 blur-[80px] -z-10 animate-pulse-slow" />
      
      <div className="mx-auto max-w-6xl px-6 lg:flex lg:items-center lg:gap-16">
        
        {/* Left Column (Hero Content) */}
        <div className="lg:w-1/2 flex flex-col justify-center text-left">
          
          {/* Announcement Pill */}
          <div className="inline-flex self-start items-center gap-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/10 px-3 py-1 text-xs font-semibold text-foreground transition-all cursor-pointer mb-6">
            <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
            <span>Developer-first platform</span>
            <span className="h-1.5 w-1.5 rounded-full bg-border" />
            <span className="text-muted-foreground flex items-center gap-0.5">
              Read Docs <ArrowRight className="h-3 w-3" />
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold leading-[1.1] text-foreground sm:text-5xl md:text-6xl tracking-tight">
            Developer-first media hosting.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-indigo-500 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Built for speed.
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
            SnapHost gives developers and product creators fast, secure, and auto-optimized image and PDF hosting with an S3-compatible API and a global Anycast CDN.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex gap-3.5 flex-wrap">
            <Button asChild size="lg" className="h-11 px-6 shadow-md shadow-accent/10 cursor-pointer font-semibold">
              <Link href="/upload">Start hosting free</Link>
            </Button>

            <Button variant="outline" asChild size="lg" className="h-11 px-6 cursor-pointer font-semibold">
              <Link href="/docs" className="flex items-center gap-2">
                <Play className="h-3.5 w-3.5 fill-current" />
                Developer Docs
              </Link>
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="mt-8 pt-6 border-t border-border/40 flex items-center gap-x-6 gap-y-2 flex-wrap text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              S3-Compatible API
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Auto WebP Optimization
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Global Edge CDN
            </div>
          </div>

        </div>

        {/* Right Column (Interactive upload dashboard preview) */}
        <div className="mt-12 lg:mt-0 lg:w-1/2 flex items-center justify-center relative">
          {/* Subtle decoration frame */}
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-purple-500/5 rounded-3xl blur-xl -z-10" />
          <UploadMock />
        </div>

      </div>
    </section>
  );
}
