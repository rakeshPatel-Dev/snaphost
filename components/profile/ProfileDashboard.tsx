'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClerk } from '@clerk/nextjs';

type FileItem = {
  id: string;
  slug: string;
  filename: string;
  file_type: 'image' | 'pdf';
  upload_type: 'anonymous' | 'custom';
  expires_at: string | null;
  created_at: string;
  publicUrl: string;
};

type ProfileDashboardProps = {
  initialUsername: string;
  email: string;
  tier: 'free' | 'premium';
  files: FileItem[];
};

export default function ProfileDashboard({
  initialUsername,
  email,
  tier,
  files: initialFiles,
}: ProfileDashboardProps) {
  const [username, setUsername] = useState(initialUsername);
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const { signOut } = useClerk();

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied');
  }

  async function updateUsername() {
    setSavingProfile(true);
    try {
      const response = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      const data = await response.json();
      if (data.user?.username) {
        setUsername(data.user.username);
      }
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveFile(file: FileItem) {
    setEditingFileId(file.id);
    try {
      const response = await fetch(`/api/me/files/${file.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: file.slug, filename: file.filename, expiresAt: file.expires_at }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update file');
      }

      const data = await response.json();
      setFiles((current) => current.map((item) => (item.id === file.id ? data.file : item)));
      toast.success('Link updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update file');
    } finally {
      setEditingFileId(null);
    }
  }

  async function deleteFile(fileId: string) {
    if (!window.confirm('Delete this link permanently?')) {
      return;
    }

    setEditingFileId(fileId);
    try {
      const response = await fetch(`/api/me/files/${fileId}`, { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete file');
      }

      setFiles((current) => current.filter((item) => item.id !== fileId));
      toast.success('Link deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete file');
    } finally {
      setEditingFileId(null);
    }
  }

  async function deleteAccount() {
    if (!window.confirm('Delete your account and all links permanently?')) {
      return;
    }

    try {
      const response = await fetch('/api/me/account', { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      toast.success('Account deleted');
      await signOut({ redirectUrl: '/' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your username and link library.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-2 md:col-span-1">
              <span className="text-sm font-medium text-foreground">Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus:border-primary"
                placeholder="yourname"
              />
            </label>
            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm font-medium text-foreground">Email</span>
              <input
                value={email}
                readOnly
                title="Email"
                placeholder="Email address"
                className="h-10 rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground outline-none"
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={updateUsername} disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save profile'}
            </Button>
            <Button variant="destructive" onClick={deleteAccount}>
              Delete account
            </Button>
            <span className="text-sm text-muted-foreground">Plan: {tier}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your links</CardTitle>
          <CardDescription>Rename, expire, copy, or delete each link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">No uploads yet.</p>
          ) : (
            files.map((file) => (
              <div key={file.id} className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="grid gap-3 flex-1">
                    <div className="grid gap-2 md:grid-cols-2">
                      <label className="grid gap-1.5">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Filename</span>
                        <input
                          value={file.filename}
                          onChange={(event) =>
                            setFiles((current) =>
                              current.map((item) =>
                                item.id === file.id ? { ...item, filename: event.target.value } : item
                              )
                            )
                          }
                          className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                          title="Filename"
                          placeholder="Filename"
                        />
                      </label>
                      <label className="grid gap-1.5">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Slug</span>
                        <input
                          value={file.slug}
                          onChange={(event) =>
                            setFiles((current) =>
                              current.map((item) =>
                                item.id === file.id ? { ...item, slug: event.target.value } : item
                              )
                            )
                          }
                          className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                          title="Slug"
                          placeholder="slug"
                        />
                      </label>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      <label className="grid gap-1.5">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Expiration</span>
                        <input
                          type="datetime-local"
                          value={file.expires_at ? file.expires_at.slice(0, 16) : ''}
                          onChange={(event) =>
                            setFiles((current) =>
                              current.map((item) =>
                                item.id === file.id ? { ...item, expires_at: event.target.value || null } : item
                              )
                            )
                          }
                          className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                          title="Expiration date and time"
                        />
                      </label>
                      <div className="grid gap-1.5">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Public URL</span>
                        <input value={file.publicUrl} readOnly title="Public URL" className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:w-40">
                    <Button variant="outline" onClick={() => copyLink(file.publicUrl)}>
                      Copy link
                    </Button>
                    <Button variant="secondary" onClick={() => saveFile(file)} disabled={editingFileId === file.id}>
                      {editingFileId === file.id ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="destructive" onClick={() => deleteFile(file.id)} disabled={editingFileId === file.id}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
