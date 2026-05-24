import React from 'react'
import { Button } from '@/components/ui/button';
import { Crown, Zap } from 'lucide-react';
import Link from 'next/link';
import { PREMIUM_FEATURES } from '@/data/PremiumFeatures';


const TierBanner = ({ isPremium }: { isPremium: boolean }) => {
  return (
    <div>
      {/* --- Tier banner --- */}
        {isPremium ? (
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-muted-foreground  shadow-sm">
                <Crown className="h-4 w-4 text-accent" />
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
    </div>
  )
}

export default TierBanner
