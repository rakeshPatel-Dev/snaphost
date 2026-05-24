'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useClerk } from '@clerk/nextjs';
import {
  Copy,
  Trash2,
  Save,
  Crown,
  Zap,
  User,
  Mail,
  Link2,
  FileImage,
  File,
  Clock,
  Check,
  Sparkles,
  Shield,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DeleteAccountDialog from '@/components/shared/DeleteAccountDialog';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { useDeleteFileMutation, useUpdateFileMutation } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import type { AppFile } from '@/types/app';

type ProfileDashboardProps = {
  initialUsername: string;
  email: string;
  tier: 'free' | 'premium';
  files: AppFile[];
};

const PREMIUM_FEATURES = [
  { icon: Zap, label: 'Unlimited uploads' },
  { icon: Shield, label: 'Password-protected links' },
  { icon: Clock, label: 'Custom expiry dates' },
  { icon: Sparkles, label: 'Priority CDN' },
];

export default function ProfileDashboard({
  initialUsername,
  email,
  tier,
  files: initialFiles,
}: ProfileDashboardProps) {
  const [username] = useState(initialUsername);
  const [files, setFiles] = useState<AppFile[]>(initialFiles);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updateFile] = useUpdateFileMutation();
  const [deleteFileMutation] = useDeleteFileMutation();
  const { signOut } = useClerk();

  const isPremium = tier === 'premium';

  async function copyLink(url: string, id: string) {
    const op = navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });

    await toast.promise(op, {
      loading: 'Copying...',
      success: 'Link copied to clipboard',
      error: 'Failed to copy link',
    });
  }

  async function saveFile(file: AppFile) {
    setEditingFileId(file.id);
    try {
      const op = updateFile({
        fileId: file.id,
        slug: file.slug,
        filename: file.filename,
        expiresAt: file.expires_at,
      })
        .unwrap()
        .then((data) => {
          setFiles((c) => c.map((item) => (item.id === file.id ? data.file : item)));
          return true;
        });

      await toast.promise(op, {
        loading: 'Saving changes...',
        success: 'Link updated',
        error: (err) => getApiErrorMessage(err, 'Failed to update file'),
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update file'));
    } finally {
      setEditingFileId(null);
    }
  }

  async function deleteFile(fileId: string) {
    setEditingFileId(fileId);
    try {
      const op = deleteFileMutation({ fileId })
        .unwrap()
        .then(() => {
        setFiles((c) => c.filter((item) => item.id !== fileId));
        return true;
      });

      await toast.promise(op, {
        loading: 'Deleting link...',
        success: 'Link deleted',
        error: (err) => getApiErrorMessage(err, 'Failed to delete file'),
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete file'));
    } finally {
      setEditingFileId(null);
    }
  }

  return (
    <TooltipProvider>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">

        {/* --- Tier banner --- */}
        {isPremium ? (
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shadow-sm">
                <Crown className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Premium plan</p>
                <p className="text-xs text-muted-foreground">You have access to all premium features.</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 flex-wrap">
              {PREMIUM_FEATURES.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted">
                <Zap className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Free plan</p>
                <p className="text-xs text-muted-foreground">Upgrade to unlock all features.</p>
              </div>
            </div>
            <Button size="sm" className="gap-1.5 shadow-sm" asChild>
              <Link href="/pricing">
                <Crown className="h-3.5 w-3.5" />
                Upgrade to Premium
              </Link>
            </Button>
          </div>
        )}

        {/* --- Profile card --- */}
        <Card className="shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Account</CardTitle>
                <CardDescription className="text-sm">Manage your profile details.</CardDescription>
              </div>
              <Badge variant={isPremium ? 'default' : 'secondary'} className={cn('gap-1', isPremium && 'bg-muted/10 text-foreground border border-border/20 hover:bg-muted/20')}>
                {isPremium ? <Crown className="h-3 w-3" /> : <User className="h-3 w-3" />}
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="username" className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground/70 font-semibold">
                  <User className="h-3 w-3" /> Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  readOnly
                  placeholder="yourname"
                  className="h-9 bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email" className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground/70 font-semibold">
                  <Mail className="h-3 w-3" /> Email
                </Label>
                <Input
                  id="email"
                  value={email}
                  readOnly
                  className="h-9 bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" disabled className="gap-1.5 h-8">
                    <Save className="h-3.5 w-3.5" />
                    Save changes
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Username cannot be changed from the profile. Contact support for assistance.
                </TooltipContent>
              </Tooltip>

              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 h-8 text-muted-foreground hover:text-foreground"
                onClick={() => signOut({ redirectUrl: '/' })}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </Button>

              <div className="ml-auto">
                <DeleteAccountDialog
                  trigger={(
                    <Button size="sm" variant="ghost" className="gap-1.5 h-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete account
                    </Button>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Links card --- */}
        <Card className="shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Your links</CardTitle>
                <CardDescription className="text-sm">
                  {files.length} {files.length === 1 ? 'link' : 'links'} — rename, set expiry, copy or delete.
                </CardDescription>
              </div>
              {files.length > 0 && (
                <Badge variant="secondary" className="text-xs tabular-nums">
                  {files.length} / {isPremium ? '∞' : '5'}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 py-12">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Link2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">No uploads yet</p>
                  <p className="text-xs text-muted-foreground">Files you upload will appear here.</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 h-8 mt-1" asChild>
                  <Link href="/upload">Upload your first file</Link>
                </Button>
              </div>
            ) : (
              files.map((file) => {
                const isEditing = editingFileId === file.id;
                const isCopied = copiedId === file.id;
                const FileIcon = file.file_type === 'pdf' ? File : FileImage;

                return (
                  <div
                    key={file.id}
                    className="group rounded-xl border border-border bg-card transition-colors hover:border-border/80 hover:bg-muted/20"
                  >
                    {/* File header row */}
                    <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                      <div className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
                        file.file_type === 'pdf'
                          ? 'border-orange-500/20 bg-orange-500/10 text-orange-500'
                          : 'border-border/20 bg-muted/10 text-foreground'
                      )}>
                        <FileIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-1 items-center gap-2 min-w-0">
                        <span className="truncate text-sm font-medium text-foreground">{file.filename}</span>
                        <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 h-4 capitalize">
                          {file.upload_type}
                        </Badge>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {new Date(file.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <Separator className="mx-4 w-auto" />

                    {/* Editable fields */}
                    <div className="grid gap-3 p-4 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">Filename</Label>
                        <Input
                          value={file.filename}
                          onChange={(e) =>
                            setFiles((c) => c.map((item) => item.id === file.id ? { ...item, filename: e.target.value } : item))
                          }
                          className="h-8 bg-background text-sm"
                          placeholder="Filename"
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">Slug</Label>
                        <Input
                          value={file.slug}
                          onChange={(e) =>
                            setFiles((c) => c.map((item) => item.id === file.id ? { ...item, slug: e.target.value } : item))
                          }
                          className="h-8 bg-background text-sm font-mono"
                          placeholder="my-slug"
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label className={cn(
                          'text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1',
                          !isPremium ? 'text-muted-foreground/40' : 'text-muted-foreground/60'
                        )}>
                          <Clock className="h-3 w-3" />
                          Expiration
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Input
                              type="datetime-local"
                              value={file.expires_at ? file.expires_at.slice(0, 16) : ''}
                              onChange={(e) =>
                                setFiles((c) => c.map((item) => item.id === file.id ? { ...item, expires_at: e.target.value || null } : item))
                              }
                              className={cn('h-8 bg-background text-sm')}
                            />
                          </TooltipTrigger>
                        </Tooltip>
                      </div>

                      <div className="grid gap-1.5">
                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">Public URL</Label>
                        <div className="flex gap-1.5">
                          <Input
                            value={file.publicUrl}
                            readOnly
                            className="h-8 bg-muted text-sm text-muted-foreground font-mono truncate cursor-text"
                          />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 shrink-0"
                                onClick={() => window.open(file.publicUrl, '_blank')}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Open link</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>

                    {/* Action row */}
                    <div className="flex items-center gap-2 border-t border-border/60 bg-muted/30 px-4 py-2.5 rounded-b-xl">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => copyLink(file.publicUrl, file.id)}
                      >
                        {isCopied ? (
                          <><Check className="h-3 w-3 text-green-500" /> Copied</>
                        ) : (
                          <><Copy className="h-3 w-3" /> Copy link</>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => saveFile(file)}
                        disabled={isEditing}
                      >
                        <Save className="h-3 w-3" />
                        {isEditing ? 'Saving…' : 'Save'}
                      </Button>

                      <div className="ml-auto">
                        <DeleteConfirmDialog
                          trigger={(
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              disabled={isEditing}
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          )}
                          title="Delete this link?"
                          description={<> <strong>{file.filename}</strong> will be permanently removed. Anyone with the link will no longer be able to access it.</>}
                          confirmLabel="Delete link"
                          destructiveClassName="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onConfirm={() => deleteFile(file.id)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}