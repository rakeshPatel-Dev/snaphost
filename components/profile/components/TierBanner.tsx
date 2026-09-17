import React from 'react';
import { Crown } from 'lucide-react';
import { PREMIUM_FEATURES } from '@/data/PremiumFeatures';

const TierBanner = ({ isPremium }: { isPremium: boolean }) => {
  if (!isPremium) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-4xl border border-border/60 bg-card/80 px-4 py-3.5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10">
          <Crown className="h-4 w-4 text-accent" />
        </div>
        <p className="text-sm font-semibold tracking-tight text-foreground">Premium plan</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {PREMIUM_FEATURES.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TierBanner;