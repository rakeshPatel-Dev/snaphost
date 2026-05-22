'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, Upload, ArrowLeft, HelpCircle } from 'lucide-react';

export default function NotFound() {
  const pathname = usePathname();

  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden px-6 py-12">
      {/* Background visual effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 -z-10" />
      
      {/* Glowing decorative circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-tr from-accent/15 to-indigo-500/5 blur-[100px] -z-10 animate-pulse-slow" />
      
      <div className="mx-auto max-w-xl text-center flex flex-col items-center">
        
        {/* Animated Icon Container */}
        <div className="relative mb-6 group">
          <div className="absolute inset-0 rounded-2xl bg-accent/10 blur-xl transition-all duration-500 group-hover:bg-accent/20 group-hover:scale-110" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl border border-border/80 bg-card shadow-lg transition-transform duration-500 group-hover:rotate-6">
            <FileQuestion className="h-10 w-10 text-accent" />
            <HelpCircle className="absolute -top-1.5 -right-1.5 h-5 w-5 text-accent animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* 404 Tag */}
        <span className="text-sm font-extrabold text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full uppercase tracking-wider mb-4">
          Error 404
        </span>
        
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-none mt-2">
          Lost in the Cloud
        </h1>
        
        <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-md">
          The page or file you are looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>

        {/* Themed Visual Placeholder for missing file */}
        <div className="mt-8 w-full border border-dashed border-border/80 rounded-2xl p-6 bg-card/50 backdrop-blur-sm shadow-sm relative overflow-hidden group">
          <div className="absolute -right-12 -bottom-12 w-24 h-24 rounded-full bg-accent/5 blur-xl group-hover:bg-accent/10 transition-colors" />
          <div className="flex items-center gap-4 text-left">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-border">
              <span className="text-xs font-mono font-bold text-muted-foreground">URL</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-muted-foreground truncate">
                {pathname}
              </p>
              <p className="text-xs text-destructive font-semibold mt-0.5">
                STATUS: 404_NOT_FOUND
              </p>
            </div>
          </div>
        </div>

        {/* Buttons / CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button asChild size="lg" className="h-11 px-6 shadow-md shadow-accent/5 cursor-pointer font-semibold">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go back home
            </Link>
          </Button>

          <Button variant="outline" asChild size="lg" className="h-11 px-6 cursor-pointer font-semibold">
            <Link href="/upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload a file
            </Link>
          </Button>
        </div>

        {/* Back Link */}
        <button 
          onClick={() => typeof window !== 'undefined' && window.history.back()}
          className="mt-6 text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3 w-3" />
          Go back to previous page
        </button>

      </div>
    </div>
  );
}
