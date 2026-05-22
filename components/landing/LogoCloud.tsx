'use client';

import React from 'react';
import { BsGithub } from 'react-icons/bs';

export default function LogoCloud() {
  return (
    <section className="py-12 border-y border-border/40 bg-muted/20 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs font-semibold tracking-wider uppercase text-muted-foreground/80">
          Powering media delivery for modern web applications
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-16 lg:gap-x-20">
          
          {/* Vercel */}
          <div className="flex items-center gap-2 text-foreground/50 hover:text-foreground grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default">
            <svg className="h-5 w-auto fill-current" viewBox="0 0 115 100">
              <path d="M57.5 0L115 100H0L57.5 0z" />
            </svg>
            <span className="font-sans font-bold tracking-tight text-lg">Vercel</span>
          </div>

          {/* Next.js */}
          <div className="flex items-center gap-1.5 text-foreground/50 hover:text-foreground grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default">
            <span className="font-sans font-extrabold tracking-tighter text-xl">NEXT.JS</span>
          </div>

          {/* Supabase */}
          <div className="flex items-center gap-1.5 text-foreground/50 hover:text-foreground grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default">
            <svg className="h-5 w-auto fill-current text-green-500" viewBox="0 0 24 24">
              <path d="M21.36 9.8a1.53 1.53 0 0 0-1.28-.82H14.1L18.4 2.1a1.27 1.27 0 0 0-2.12-1.35L4.4 12.8a1.53 1.53 0 0 0 1.28.82h5.98L7.36 21.9a1.27 1.27 0 0 0 2.12 1.35L21.36 11.2a1.53 1.53 0 0 0 0-1.4z" />
            </svg>
            <span className="font-sans font-semibold tracking-tight text-lg">supabase</span>
          </div>

          {/* Cloudflare */}
          <div className="flex items-center gap-2 text-foreground/50 hover:text-foreground grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default">
            <svg className="h-6 w-auto fill-current" viewBox="0 0 24 24">
              <path d="M21.73 10.6a5.53 5.53 0 0 0-4.66-3.83 6.94 6.94 0 0 0-12.87-.27A4.7 4.7 0 0 0 4.72 16h15.42a4.34 4.34 0 0 0 1.59-5.4z" />
            </svg>
            <span className="font-sans font-bold tracking-tight text-lg">Cloudflare</span>
          </div>

          {/* Stripe */}
          <div className="flex items-center gap-1 text-foreground/50 hover:text-foreground grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default">
            <span className="font-sans font-black tracking-tight text-xl italic text-[#635bff]">stripe</span>
          </div>

          {/* GitHub */}
          <div className="flex items-center gap-2 text-foreground/50 hover:text-foreground grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default">
            <BsGithub className="h-5 w-5" />
            <span className="font-sans font-semibold text-base">GitHub</span>
          </div>

        </div>
      </div>
    </section>
  );
}
