'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Crown, LogOut, Mail, Pencil, Trash2, User } from 'lucide-react';
import DeleteAccountDialog from '@/components/shared/DeleteAccountDialog';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import UsernameAvailability from '@/components/auth/UsernameAvailability';
import ProfileLink from './ProfileLink';
import { useAuth } from '@/components/providers/auth-provider';
import { useUsernameAvailability } from '@/lib/useUsernameAvailability';
import { useUpdateMeUsernameMutation } from '@/state/api';


type AccountInfoProps = {
  isPremium: boolean;
  tier: string;
  email: string;
  username: string;
}

const AccountInfo = ({ isPremium, tier, email, username }: AccountInfoProps) => {
  const { signOut, refreshUser } = useAuth();
  const [updateMeUsername] = useUpdateMeUsernameMutation();

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(username || '');
  const [displayUsername, setDisplayUsername] = useState(() => username || '');
  const { normalizedUsername, status, isAvailable, isChecking } = useUsernameAvailability({
    value,
    enabled: editing,
    currentUsername: username,
  });

  async function saveUsername() {
    const currentNormalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername || normalizedUsername === currentNormalizedUsername) {
      setEditing(false);
      return;
    }

    if (!isAvailable) {
      toast.error('Pick an available username before saving');
      return;
    }

    try {
      await updateMeUsername({ username: normalizedUsername }).unwrap();
      await refreshUser();
      toast.success('Username updated');
      setDisplayUsername(normalizedUsername);
      setValue(normalizedUsername);
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update username');
    }
  }

  return (
    <div>
      <Card className="shadow-sm border-border/40 overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/40 bg-muted/5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold tracking-tight">Account Settings</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                View and manage your profile information
              </CardDescription>
            </div>
            <Badge
              variant={isPremium ? 'default' : 'secondary'}
              className={cn(
                'gap-1.5 px-3 py-1 text-xs font-medium transition-all',
                isPremium && 'bg-linear-to-r from-amber-500/10 to-amber-600/10 text-amber-600 border-amber-200 dark:border-amber-800',
                !isPremium && 'bg-muted/50'
              )}
            >
              {isPremium ? <Crown className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Profile Information */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                <User className="h-3 w-3" />
                Username
              </Label>
              <div>
                {!editing ? (
                  <div className="h-10 flex items-center px-3 bg-muted/30 rounded-lg text-sm group font-mono text-foreground/80 border border-border/30">
                    <span className="truncate">{displayUsername || 'yourname'}</span>
                    <Button
                      title="Edit username"
                      size="icon"
                      variant="ghost"
                      className="ml-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => { setValue(displayUsername || ''); setEditing(true); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <UsernameAvailability
                        id="username"
                        value={value}
                        isChecking={isChecking}
                        statusText={status.text}
                        statusTone={status.tone}
                        onChange={setValue}
                        className=""
                      />
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Button
                        type="button"
                        onClick={saveUsername}
                        disabled={isChecking}
                        className="h-9 rounded-xl px-4 text-sm font-medium shadow-sm sm:w-auto"
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditing(false)}
                        className="h-9 rounded-xl px-4 text-sm font-medium text-muted-foreground hover:text-foreground sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                <Mail className="h-3 w-3" />
                Email Address
              </Label>
              <div
                id="email"
                className="h-10 flex items-center px-3 bg-muted/30 rounded-lg text-sm text-foreground/80 border border-border/30"
              >
                {email}
              </div>
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Actions Section */}
          <div className="flex flex-wrap items-center justify-between gap-3">


            <div className="flex items-center gap-2">
              <ProfileLink
                asButton
                onClick={async () => {
                  await signOut();
                  window.location.href = '/';
                }}
                className="gap-2 h-9 px-3 inline-flex items-center text-muted-foreground hover:text-foreground transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </ProfileLink>

              <DeleteAccountDialog
                trigger={(
                  <ProfileLink
                    asButton
                    className="gap-2 h-9 px-3 inline-flex items-center text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Account
                  </ProfileLink>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountInfo
