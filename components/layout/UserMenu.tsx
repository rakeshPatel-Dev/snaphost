'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/components/providers/auth-provider'
import { useTier } from '@/lib/useTier'

export default function UserMenu() {
  const { user } = useAuth()
  const { isPremium } = useTier()
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null)

  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>
  const identityData = (
    (user?.identities ?? []) as Array<{
      identity_data?: Record<string, unknown>
    }>
  ).map((identity) => identity.identity_data ?? {})

  const avatarUrl = [
    meta.avatar_url,
    meta.avatarUrl,
    meta.picture,
    meta.image,
    meta.image_url,
    ...identityData.flatMap((data) => [
      data.avatar_url,
      data.avatarUrl,
      data.picture,
      data.image,
      data.image_url,
    ]),
  ].find((value): value is string => typeof value === 'string' && value.trim().length > 0)
  const usableAvatarUrl = avatarUrl && avatarUrl !== failedAvatarUrl ? avatarUrl : null

  const displayName = String(
    meta.full_name ?? meta.name ?? meta.username ?? user?.email ?? 'Profile'
  )
  const initial = displayName.trim().charAt(0).toUpperCase()

  return (
    <Button asChild variant="ghost" size="sm" className="relative h-8 w-8 rounded-full p-0">
      <Link href="/profile" aria-label="Open profile">
        <Avatar size="sm" className="bg-muted ring-2 ring-accent/20 shadow-sm dark:ring-accent/35">
          {usableAvatarUrl ? (
            <AvatarImage
              src={usableAvatarUrl}
              alt={displayName}
              onLoadingStatusChange={(status) => {
                if (status === 'error') setFailedAvatarUrl(usableAvatarUrl)
              }}
            />
          ) : null}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        {isPremium && (
          <span className="premium-gradient absolute -bottom-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none text-white ring-2 ring-background shadow-sm">
            P
          </span>
        )}
      </Link>
    </Button>
  )
}
