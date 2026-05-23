'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import ProfileDashboard from './ProfileDashboard';

type ApiUser = {
  id: string;
  username: string | null;
  email: string;
  tier: 'free' | 'premium';
};

type ApiFile = {
  id: string;
  slug: string;
  filename: string;
  file_type: 'image' | 'pdf';
  upload_type: 'anonymous' | 'custom';
  expires_at: string | null;
  created_at: string;
  publicUrl: string;
};

export default function ProfileGate() {
  const { isLoaded, isSignedIn } = useUser();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [files, setFiles] = useState<ApiFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    let alive = true;

    async function loadProfile() {
      try {
        setLoading(true);

        const [meResponse, filesResponse] = await Promise.all([
          fetch('/api/me'),
          fetch('/api/me/files'),
        ]);

        if (!meResponse.ok) {
          throw new Error('Unable to load profile');
        }

        if (!filesResponse.ok) {
          throw new Error('Unable to load files');
        }

        const meData = await meResponse.json();
        const filesData = await filesResponse.json();

        if (!alive) {
          return;
        }

        setUser(meData.user);
        setFiles(filesData.files ?? []);
        setError(null);
      } catch (loadError) {
        if (!alive) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : 'Failed to load profile');
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      alive = false;
    };
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) {
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
          <p className="text-sm text-muted-foreground">{error || 'Try refreshing the page.'}</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileDashboard
      initialUsername={user.username || ''}
      email={user.email}
      tier={user.tier}
      files={files}
    />
  );
}
