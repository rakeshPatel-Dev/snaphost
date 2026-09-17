'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, UploadCloud } from 'lucide-react';
import Container from '@/components/shared/Container';

export default function CTA() {
  return (
    <section className="pt-20 sm:pt-24 pb-20 sm:pb-24 relative overflow-hidden">
      <Container>
        <div className="relative rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-8 sm:p-12 md:p-14 text-left shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] overflow-hidden">
          <div className="absolute -top-24 left-1/4 w-[80vw] max-w-[600px] h-96 rounded-full bg-accent/5 blur-[80px] pointer-events-none -z-10" />
          <div className="absolute -bottom-24 right-1/4 w-[80vw] max-w-[600px] h-96 rounded-full bg-accent/5 blur-[80px] pointer-events-none -z-10" />

          <div className="max-w-2xl">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
              Ready to replace messy attachments with clean links?
            </h3>

            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Upload anonymously or create an account to manage files, usernames, and expiration settings from one place.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Button asChild size="lg" className="rounded-full h-11 px-6 font-medium text-sm cursor-pointer">
                <Link href="/sign-up" className="flex items-center gap-2">
                  Create free account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button variant="outline" asChild size="lg" className="rounded-full h-11 px-6 font-medium text-sm cursor-pointer">
                <Link href="/upload" className="flex items-center gap-2">
                  <UploadCloud className="h-4 w-4" />
                  Upload anonymously
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground font-medium">
              No credit card required • Anonymous uploads enabled • Manage files anytime
            </p>
          </div>

        </div>
      </Container>
    </section>
  );
}