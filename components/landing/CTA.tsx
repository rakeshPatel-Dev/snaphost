'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, UploadCloud } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-8 md:p-14 text-left shadow-2xl overflow-hidden ring-1 ring-border/20">
          
          {/* Inner Grid Background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 -z-10" />
          
          {/* Internal glows */}
          <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[80px] -z-10" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[80px] -z-10" />

          <div className="max-w-2xl">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3.5 py-1 text-xs font-medium text-foreground mb-6">
              <Sparkles className="h-3 w-3 text-accent" />
              <span>Start sharing today</span>
            </div>

            {/* Heading */}
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
              Ready to replace messy attachments with clean links?
            </h3>
            
            {/* Description */}
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Upload anonymously or create an account to manage files, usernames, and expiration settings from one place.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Button asChild size="lg" className="rounded-full h-11 px-7 bg-foreground text-background hover:bg-foreground/90 font-medium text-sm transition-all shadow-sm cursor-pointer">
                <Link href="/sign-up" className="flex items-center gap-2">
                  Create free account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button variant="outline" asChild size="lg" className="rounded-full h-11 px-6 font-medium text-sm cursor-pointer border-border/80 hover:bg-muted/40">
                <Link href="/upload" className="flex items-center gap-2">
                  <UploadCloud className="h-4 w-4" />
                  Upload anonymously
                </Link>
              </Button>
            </div>

            {/* Footnotes */}
            <p className="mt-6 text-xs text-muted-foreground font-medium">
              No credit card required • Anonymous uploads enabled • Manage files anytime
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
