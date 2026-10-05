'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Crown, LogOut, Pencil, Trash2, User } from 'lucide-react'
import DeleteAccountDialog from '@/components/shared/DeleteAccountDialog'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'
import UsernameAvailability from '@/components/auth/UsernameAvailability'
import { useAuth } from '@/components/providers/auth-provider'
import { useUsernameAvailability } from '@/lib/useUsernameAvailability'
import { useUpdateMeUsernameMutation } from '@/state/api'
import { getApiErrorMessage } from '@/lib/api-error'
import { AUTH_ERRORS } from '@/lib/messages'
import posthog from 'posthog-js'
import { posthogEnabled } from '@/lib/posthog'

type AccountInfoProps = {
  isPremium: boolean
  tier: string
  email: string
  username: string
}

const AccountInfo = ({ isPremium, tier, email, username }: AccountInfoProps) => {
  const { signOut, refreshUser } = useAuth()
  const [updateMeUsername] = useUpdateMeUsernameMutation()
  const router = useRouter()

  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(username || '')
  const [displayUsername, setDisplayUsername] = useState(() => username || '')
  const { normalizedUsername, status, isAvailable, isChecking } = useUsernameAvailability({
    value,
    enabled: editing,
    currentUsername: username,
  })
  const planSummary = isPremium ? 'Unlimited active links' : 'Up to 5 active links'

  async function saveUsername() {
    const currentNormalizedUsername = username.trim().toLowerCase()

    if (!normalizedUsername || normalizedUsername === currentNormalizedUsername) {
      setEditing(false)
      return
    }

    if (!isAvailable) {
      toast.error(AUTH_ERRORS.pickAvailableUsername)
      return
    }

    try {
      await toast.promise(
        updateMeUsername({ username: normalizedUsername })
          .unwrap()
          .then(async () => {
            await refreshUser()
            if (posthogEnabled) {
              posthog.capture('username_updated')
            }
          }),
        {
          loading: 'Saving username…',
          success: 'Username updated',
          error: (err) => getApiErrorMessage(err, AUTH_ERRORS.failedToUpdateUsername),
        }
      )
      setDisplayUsername(normalizedUsername)
      setValue(normalizedUsername)
      setEditing(false)
    } catch {}
  }

  return (
    <div className="rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-sm">
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-4',
          editing && value !== displayUsername && 'border-accent/30'
        )}
      >
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Account</h2>
          <p className="mt-1 text-xs text-muted-foreground">Your identity and plan details</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{planSummary}</span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
              isPremium
                ? 'border-amber-400/25 bg-amber-400/10 text-amber-500'
                : 'border-border/60 bg-muted/20 text-muted-foreground'
            )}
          >
            {isPremium ? <Crown className="h-4 w-4" /> : <User className="h-4 w-4" />}
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid gap-5 px-5 py-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">
            Username
          </Label>
          <div>
            {!editing ? (
              <div className="flex h-10 items-center gap-2 rounded-full border border-border/60 bg-muted/20 pl-4 pr-2">
                <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground/80">
                  {displayUsername ? `@${displayUsername}` : 'Add a username'}
                </span>
                <Button
                  title="Edit username"
                  aria-label="Edit username"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0 rounded-full"
                  onClick={() => {
                    setValue(displayUsername || '')
                    setEditing(true)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <UsernameAvailability
                    id="username"
                    value={value}
                    isChecking={isChecking}
                    statusText={status.text}
                    statusTone={status.tone}
                    onChange={setValue}
                    className="rounded-full border-border/60 bg-muted/20"
                  />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    onClick={saveUsername}
                    disabled={isChecking || value.trim().toLowerCase() === displayUsername}
                    className="h-9 px-4 text-sm"
                  >
                    Save changes
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setValue(displayUsername)
                      setEditing(false)
                    }}
                    className="h-9 px-4 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Discard
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Email</Label>
          <div
            id="email"
            className="flex h-10 items-center truncate rounded-full border border-border/60 bg-muted/15 px-4 text-sm text-foreground/80"
          >
            {email}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 bg-muted/[0.12] px-5 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={async () => {
              await signOut()
              router.push('/')
            }}
            className="gap-2 px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>

          <DeleteAccountDialog
            trigger={
              <Button
                variant="ghost"
                className="gap-2 px-3 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </Button>
            }
          />
        </div>
      </div>
    </div>
  )
}

export default AccountInfo
