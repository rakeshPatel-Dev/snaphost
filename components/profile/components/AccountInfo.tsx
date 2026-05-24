import React from 'react'
import { useClerk } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Crown, LogOut, Mail, Trash2, User } from 'lucide-react';
import DeleteAccountDialog from '@/components/shared/DeleteAccountDialog';
import { cn } from '@/lib/utils';
import ProfileLink from './ProfileLink';


type AccountInfoProps = {
  isPremium: boolean;
  tier: string;
  email: string;
  username: string;
}

const AccountInfo = ({ isPremium, tier, email, username }: AccountInfoProps) => {

    const { signOut } = useClerk();

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
        <div 
          id="username" 
          className="h-10 flex items-center px-3 bg-muted/30 rounded-lg text-sm font-mono text-foreground/80 border border-border/30"
          title="Username cannot be changed"
        >
          {username || 'yourname'}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
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
        {/* <Info className="h-3.5 w-3.5 text-muted-foreground/60" /> */}
        <p className="text-xs text-muted-foreground/80">
          Username is permanent. <ProfileLink href="mailto:hello@snaphost.cloud" className="underline underline-offset-2 hover:text-foreground transition-colors">Contact support</ProfileLink> for changes.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ProfileLink
          asButton
          onClick={() => signOut({ redirectUrl: '/' })}
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
