'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/components/providers/auth-provider'
import { useTier } from '@/lib/useTier'

export default function UserMenu() {
  const { user } = useAuth()
  const { isPremium } = useTier()

  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>
  const identityData = (
    (user?.identities ?? []) as Array<{
      identity_data?: Record<string, unknown>
    }>
  ).map((identity) => identity.identity_data ?? {})

  const avatarUrl =
    (meta.avatar_url as string | undefined) ??
    (meta.picture as string | undefined) ??
    identityData
      .flatMap((data) => [data.avatar_url, data.picture])
      .find((value): value is string => typeof value === 'string' && value.length > 0) ??
    null

  const displayName = String(
    meta.full_name ?? meta.name ?? meta.username ?? user?.email ?? 'Profile'
  )
  const initial = displayName.trim().charAt(0).toUpperCase()

  return (
    <Button asChild variant="ghost" size="sm" className="relative h-8 w-8 rounded-full p-0">
      <Link href="/profile" aria-label="Open profile">
        <Avatar size="sm" className="bg-muted ring-2 ring-accent/20 shadow-sm dark:ring-accent/35">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        {isPremium && (
          <span className="premium-gradient absolute -bottom-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-[3px] text-[8px] font-bold leading-none text-white ring-2 ring-background">
            P
          </span>
        )}
      </Link>
    </Button>
  )
}
