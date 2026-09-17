'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Container from '@/components/shared/Container';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-16 sm:py-24">
      <div className="relative max-w-md text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] max-w-[400px] aspect-square rounded-full bg-accent/5 blur-[100px] -z-10 pointer-events-none" />

        <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>

        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="h-11 px-6 cursor-pointer">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>

          <Button variant="outline" asChild size="lg" className="h-11 px-6 cursor-pointer">
            <Link href="/upload" className="flex items-center gap-2">
              Upload a file
            </Link>
          </Button>
        </div>

        <button
          onClick={() => typeof window !== 'undefined' && window.history.back()}
          className="mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          Go back
        </button>
      </div>
    </Container>
  );
}
