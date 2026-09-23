'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Container from '@/components/shared/Container'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error('Route error:', error)
  }, [error])

  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-16 sm:py-24">
      <div className="relative max-w-md text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] max-w-[400px] aspect-square rounded-full bg-destructive/5 blur-[100px] -z-10 pointer-events-none" />

        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </div>

        <h1 className="mt-6 text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
          Something went wrong
        </h1>

        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          An unexpected error occurred while loading this page. Please try again in a moment.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" className="h-11 px-6 gap-2 cursor-pointer" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>

          <Button asChild variant="outline" size="lg" className="h-11 px-6 cursor-pointer">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  )
}
