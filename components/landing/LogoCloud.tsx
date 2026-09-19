'use client';

import React from 'react';
import Container from '@/components/shared/Container';
import Reveal from '@/components/motion/Reveal';

export default function LogoCloud() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16">
          {/* Vercel */}
          <Reveal className="flex items-center gap-2 text-muted-foreground/60">
            <svg className="h-4 w-auto fill-current" viewBox="0 0 115 100">
              <path d="M57.5 0L115 100H0L57.5 0z" />
            </svg>
            <span className="font-sans font-bold tracking-tight text-lg">Vercel</span>
          </Reveal>

          {/* Next.js */}
          <Reveal delay={0.05} className="text-muted-foreground/60">
            <span className="font-sans font-extrabold tracking-tighter text-xl">NEXT.JS</span>
          </Reveal>

          {/* Supabase */}
          <Reveal delay={0.1} className="flex items-center gap-1.5 text-muted-foreground/60">
            <svg className="h-4 w-auto fill-current" viewBox="0 0 24 24">
              <path d="M21.36 9.8a1.53 1.53 0 0 0-1.28-.82H14.1L18.4 2.1a1.27 1.27 0 0 0-2.12-1.35L4.4 12.8a1.53 1.53 0 0 0 1.28.82h5.98L7.36 21.9a1.27 1.27 0 0 0 2.12 1.35L21.36 11.2a1.53 1.53 0 0 0 0-1.4z" />
            </svg>
            <span className="font-sans font-semibold tracking-tight text-lg">supabase</span>
          </Reveal>

          {/* Cloudflare */}
          <Reveal delay={0.15} className="flex items-center gap-2 text-muted-foreground/60">
            <svg className="h-5 w-auto fill-current" viewBox="0 0 24 24">
              <path d="M21.73 10.6a5.53 5.53 0 0 0-4.66-3.83 6.94 6.94 0 0 0-12.87-.27A4.7 4.7 0 0 0 4.72 16h15.42a4.34 4.34 0 0 0 1.59-5.4z" />
            </svg>
            <span className="font-sans font-bold tracking-tight text-lg">Cloudflare</span>
          </Reveal>

          {/* Stripe */}
          <Reveal delay={0.2} className="text-muted-foreground/60">
            <span className="font-sans font-black tracking-tight text-xl italic">stripe</span>
          </Reveal>

          {/* GitHub */}
          <Reveal delay={0.25} className="flex items-center gap-2 text-muted-foreground/60">
            <svg className="h-5 w-auto fill-current" viewBox="0 0 24 24">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
            </svg>
            <span className="font-sans font-semibold text-base">GitHub</span>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}