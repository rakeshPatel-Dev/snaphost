'use client';

import { Loader2 } from 'lucide-react';
import ProfileDashboard from './ProfileDashboard';
import { getApiErrorMessage } from '@/lib/api-error';
import { useProfileData } from '@/lib/useProfileData';
import Container from '@/components/shared/Container';

export default function ProfileGate() {
  const { isLoading, isSignedIn, loadingProfile, error, user, files } = useProfileData();

  if (isLoading || (isSignedIn && loadingProfile)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-12 sm:py-16 text-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">Sign in to manage your links</h1>
          <p className="text-sm text-muted-foreground">
            Your profile and uploads are available after authentication.
          </p>
        </div>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-12 sm:py-16 text-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">Profile unavailable</h1>
          <p className="text-sm text-muted-foreground">
            {getApiErrorMessage(error, 'Try refreshing the page.')}
          </p>
        </div>
      </Container>
    );
  }

  return (
    <ProfileDashboard
      key={`${user.id}:${user.username || ''}`}
      initialUsername={user.username || ''}
      email={user.email}
      tier={user.tier}
      files={files}
    />
  );
}
