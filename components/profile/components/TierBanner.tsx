import React from 'react'
import { Crown, ArrowRight } from 'lucide-react'
import { PREMIUM_FEATURES } from '@/data/PremiumFeatures'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const TierBanner = ({ isPremium }: { isPremium: boolean }) => {
  if (!isPremium) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-4xl border border-accent/30 bg-accent/5 px-4 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10">
            <Crown className="h-4 w-4 text-accent" />
          </div>
          <p className="text-sm font-semibold tracking-tight text-foreground">
            Want more control? Upgrade to Pro
          </p>
        </div>
        <Button asChild size="sm" className="text-xs">
          <Link href="/getpro" className="flex items-center gap-1.5">
            Get Pro access
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-4xl border border-[var(--premium-border)] bg-[var(--premium-soft)] px-4 py-3.5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--premium-soft)]">
          <Crown className="h-4 w-4 text-[var(--premium)]" />
        </div>
        <p className="text-sm font-bold tracking-tight text-[var(--premium)]">Premium plan</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {PREMIUM_FEATURES.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-[var(--premium)] opacity-80" />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default TierBanner
