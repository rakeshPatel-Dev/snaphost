'use client';

import Link from 'next/link';
import { ArrowRight, CloudLightning, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';
import AuthForm from '@/components/auth/AuthForm';
import DashedGrid from '@/components/shared/DashedGrid';

type AuthScreenProps = {
  mode: 'sign-in' | 'sign-up';
};

export default function AuthScreen({ mode }: AuthScreenProps) {
  const isSignIn = mode === 'sign-in';

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      {/* Background dashed grid */}
      <DashedGrid absolute zIndex={-1} opacity={0.5} />
      
      {/* Premium neutral glows */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-2xl -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <section className="relative order-2 overflow-hidden rounded-4xl border border-border/80 bg-card/80 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.05)] backdrop-blur-xl lg:order-1 lg:p-10 xl:p-12 dark:shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.04),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.02),transparent_40%)]" />

          <div className="relative space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/85 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-muted-foreground shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Secure, fast file sharing
            </div>

            <div className="max-w-xl space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
                SnapHost access
              </p>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl ">
                {isSignIn ? 'Welcome back to your link workspace.' : 'Create your SnapHost account in seconds.'}
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                {isSignIn
                  ? 'Sign in to manage your uploads, edit share links, and keep every file under your control.'
                  : 'Set up your profile, get a clean username link, and start sharing files with expiring access.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: UploadCloud,
                  title: 'Upload fast',
                  description: 'Drop images or PDFs and get a link instantly.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Control access',
                  description: 'Use anonymous or custom links with expiry rules.',
                },
                {
                  icon: CloudLightning,
                  title: 'Stay organized',
                  description: 'Track files, usernames, and cleanup from one place.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-border/80 bg-background/75 p-4 shadow-sm backdrop-blur-sm"
                >
                  <item.icon className="h-5 w-5 text-accent" />
                  <h2 className="mt-3 text-sm font-semibold text-foreground">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={isSignIn ? '/sign-up' : '/sign-in'}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:-translate-y-0.5 hover:opacity-90"
              >
                {isSignIn ? 'Create account' : 'Sign in instead'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-4 py-2.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition hover:border-border hover:bg-muted/60"
              >
                Go to home
              </Link>
            </div>
          </div>
        </section>

        <section className="order-1 flex items-center justify-center lg:order-2">
          <div className="w-full max-w-md space-y-3">
            <AuthForm mode={mode} />
          </div>
        </section>
      </div>
    </div>
  );
}