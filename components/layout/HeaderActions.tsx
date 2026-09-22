'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler'
import { useAuth } from '@/components/providers/auth-provider'
import UserMenu from './UserMenu'

export default function HeaderActions() {
  const { isSignedIn } = useAuth()

  return (
    <div className="hidden md:flex items-center gap-3">
      <AnimatedThemeToggler className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200" />

      {!isSignedIn ? (
        <Button
          size="sm"
          className="rounded-full h-8 px-4 text-xs font-medium bg-foreground text-background hover:bg-foreground/90 transition-all shadow-sm cursor-pointer"
          asChild
        >
          <Link href="/sign-in">Sign in</Link>
        </Button>
      ) : (
        <UserMenu />
      )}
    </div>
  )
}
