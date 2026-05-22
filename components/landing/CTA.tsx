'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, UploadCloud } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative rounded-3xl border border-border/80 bg-card px-8 py-14 md:py-20 text-center shadow-[0_30px_80px_-40px_rgba(0,0,0,0.15)] overflow-hidden">
          
          {/* Inner Grid Backgroud */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 -z-10" />
          
          {/* Internal glows */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-accent/10 blur-[80px] -z-10" />
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-[80px] -z-10" />

          {/* Tag */}
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-accent bg-accent/5 border border-accent/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-6">
            <Sparkles className="h-3 w-3" />
            Get Started Instantly
          </div>

          {/* Heading */}
          <h3 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl md:text-5xl max-w-2xl mx-auto leading-[1.1]">
            Ready to experience next-generation media hosting?
          </h3>
          
          {/* Description */}
          <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join thousands of developers and product creators who trust SnapHost to process, compress, and deliver their files globally in milliseconds.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="h-11 px-6 shadow-md shadow-accent/5 cursor-pointer font-semibold">
              <Link href="/signup" className="flex items-center gap-2">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button variant="outline" asChild size="lg" className="h-11 px-6 cursor-pointer font-semibold">
              <Link href="/upload" className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4" />
                Upload anonymously
              </Link>
            </Button>
          </div>

          {/* Footnotes */}
          <p className="mt-5 text-xs text-muted-foreground font-medium">
            Free tier includes 1GB storage • No credit card required • Cancel anytime
          </p>

        </div>
      </div>
    </section>
  );
}
