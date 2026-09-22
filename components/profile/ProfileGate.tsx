'use client'

import Link from 'next/link'
import ProfileDashboard from './ProfileDashboard'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api-error'
import { useProfileData } from '@/lib/useProfileData'
import Container from '@/components/shared/Container'

export default function ProfileGate() {
  const { isLoading, isSignedIn, loadingProfile, error, user, files } = useProfileData()

  if (isLoading || (isSignedIn && loadingProfile)) {
    return (
      <Container className="py-12 sm:py-16">
        <div className="space-y-6 motion-safe:animate-pulse" aria-busy="true" role="status">
          <div className="h-16 rounded-4xl border border-border/60 bg-muted/30" />
          <div className="rounded-4xl border border-border/60 bg-card/80">
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
              <div className="h-5 w-24 rounded-full bg-muted/60" />
              <div className="h-6 w-20 rounded-full bg-muted/60" />
            </div>
            <div className="grid gap-5 px-5 py-6 sm:grid-cols-2">
              <div className="h-10 rounded-full bg-muted/50" />
              <div className="h-10 rounded-full bg-muted/50" />
            </div>
          </div>
          <div className="rounded-4xl border border-border/60 bg-card/80">
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
              <div className="h-5 w-28 rounded-full bg-muted/60" />
              <div className="h-6 w-16 rounded-full bg-muted/60" />
            </div>
            {[0, 1].map((i) => (
              <div key={i} className="space-y-4 px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted/60" />
                  <div className="h-4 w-2/3 rounded-full bg-muted/50" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="h-9 rounded-full bg-muted/50" />
                  <div className="h-9 rounded-full bg-muted/50" />
                </div>
              </div>
            ))}
          </div>
          <span className="sr-only">Loading your profile</span>
        </div>
      </Container>
    )
  }

  if (!isSignedIn) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-12 sm:py-16 text-center">
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
              Sign in to manage your links
            </h1>
            <p className="text-sm text-muted-foreground">
              Your profile and uploads are available after authentication.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-11 px-6 cursor-pointer">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="h-11 px-6 cursor-pointer">
              <Link href="/sign-up">Create account</Link>
            </Button>
          </div>
        </div>
      </Container>
    )
  }

  if (error || !user) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-12 sm:py-16 text-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            Profile unavailable
          </h1>
          <p className="text-sm text-muted-foreground">
            {getApiErrorMessage(error, 'Try refreshing the page.')}
          </p>
        </div>
      </Container>
    )
  }

  return (
    <ProfileDashboard
      key={`${user.id}:${user.username || ''}`}
      initialUsername={user.username || ''}
      email={user.email}
      tier={user.tier}
      files={files}
    />
  )
}
