'use client';

import { Loader2 } from 'lucide-react';
import ProfileDashboard from './ProfileDashboard';
import { getApiErrorMessage } from '@/lib/api-error';
import { useProfileData } from '@/lib/useProfileData';

export default function ProfileGate() {
  const { isLoading, isSignedIn, loadingProfile, error, user, files } = useProfileData();

  if (isLoading || (isSignedIn && loadingProfile)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 text-center">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">Sign in to manage your links</h1>
          <p className="text-sm text-muted-foreground">
            Your profile and uploads are available after authentication.
          </p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 text-center">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">Profile unavailable</h1>
          <p className="text-sm text-muted-foreground">
            {getApiErrorMessage(error, 'Try refreshing the page.')}
          </p>
        </div>
      </div>
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
