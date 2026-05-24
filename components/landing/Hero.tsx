'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UploadMock } from '../sections/UploadMock';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import Announcement from './Announcement';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 border-b border-border/20">
      {/* Background visual effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 -z-10" />
      
      {/* Glowing decorative circles */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-125 h-125 rounded-full bg-linear-to-tr from-background/10 to-accent/10 blur-[80px] -z-10 animate-pulse-slow" />
      
      <div className="mx-auto max-w-6xl px-6 lg:flex lg:items-center lg:gap-16">
        
        {/* Left Column (Hero Content) */}
        <div className="lg:w-1/2 flex flex-col justify-center text-left">
          
          {/* Announcement Pill */}
          <div className="inline-flex self-start items-center gap-1.5 rounded-full bg-muted/10 hover:bg-muted/20 border border-border/10 px-3 py-1 text-xs font-semibold text-foreground transition-all cursor-pointer mb-6">
            <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
            <span><Announcement/> is live</span>   
            <span className="h-1.5 w-1.5 rounded-full bg-border" />
            <span className="text-muted-foreground flex items-center gap-0.5">
              Upload fast <ArrowRight className="h-3 w-3" />
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold leading-[1.1] text-foreground sm:text-5xl md:text-6xl tracking-tight">
            Share files with clean links.{' '}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-background to-accent dark:from-accent dark:to-accent">
              Upload, manage, and move on.
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
            Upload images or PDFs in seconds. Anonymous links are ready instantly, and signed-in users get a dashboard, direct username URLs, and expiration controls.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex gap-3.5 flex-wrap">
            <Button asChild size="lg" className="h-11 px-6 shadow-md shadow-accent/10 cursor-pointer font-semibold">
              <Link href="/upload">Upload anonymously</Link>
            </Button>

            <Button variant="outline" asChild size="lg" className="h-11 px-6 cursor-pointer font-semibold">
              <Link href="/sign-up" className="flex items-center gap-2">
                <Play className="h-3.5 w-3.5 fill-current" />
                Create account
              </Link>
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="mt-8 pt-6 border-t border-border/40 flex items-center gap-x-6 gap-y-2 flex-wrap text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Anonymous uploads
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Username-based links
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Expiration controls
            </div>
          </div>

        </div>

        {/* Right Column (Interactive upload dashboard preview) */}
        <div className="mt-12 lg:mt-0 lg:w-1/2 flex items-center justify-center relative">
          {/* Subtle decoration frame */}
          <div className="absolute inset-0 bg-linear-to-tr from-accent/5 via-transparent to-accent/5 rounded-3xl blur-xl -z-10" />
          <UploadMock />
        </div>

      </div>
    </section>
  );
}
