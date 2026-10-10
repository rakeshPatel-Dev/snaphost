'use client'

import Link from 'next/link'
import ProfileDashboard from './ProfileDashboard'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api-error'
import { useProfileData } from '@/lib/useProfileData'
import Container from '@/components/shared/Container'
import BrandLoader from '@/components/shared/BrandLoader'

export default function ProfileGate() {
  const { isLoading, isSignedIn, loadingProfile, error, user, files, bundles } = useProfileData()

  if (isLoading || (isSignedIn && loadingProfile)) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-12 sm:py-16">
        <div className="flex flex-col items-center gap-3" aria-busy="true">
          <BrandLoader size="lg" label="Loading your profile" />
          <p className="text-sm text-muted-foreground">Loading your profile…</p>
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
      bundles={bundles}
    />
  )
}
