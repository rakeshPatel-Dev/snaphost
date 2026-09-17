'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Minus, Zap, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type BillingCycle = 'monthly' | 'yearly';

interface Feature {
  label: string;
  free: string | boolean;
  starter: string | boolean;
  pro: string | boolean;
}

const features: Feature[] = [
  { label: 'File uploads',          free: 'PNG, JPG, WEBP, PDF', starter: 'PNG, JPG, WEBP, PDF', pro: 'PNG, JPG, WEBP, PDF' },
  { label: 'Max file size',         free: '10 MB',               starter: '10 MB',               pro: '50 MB' },
  { label: 'Max links per day',     free: '3 links',             starter: '5 links',             pro: 'Unlimited' },
  { label: 'Anonymous upload',      free: true,                  starter: true,                  pro: true },
  { label: 'Link expiration',       free: '24 hours (auto)',     starter: 'User-controlled',     pro: 'User-controlled' },
  { label: 'Custom URL path',       free: false,                 starter: true,                  pro: true },
  { label: 'File management dashboard', free: false,             starter: true,                  pro: true },
  { label: 'Delete uploads',        free: false,                 starter: true,                  pro: true },
  { label: 'Custom expiry rules',   free: false,                 starter: true,                  pro: true },
  { label: 'Password-protected links', free: false,              starter: false,                 pro: true },
  { label: 'Custom domain',         free: false,                 starter: false,                 pro: true },
  { label: 'Upload analytics',      free: false,                 starter: false,                 pro: true },
  { label: 'API access',            free: false,                 starter: false,                 pro: true },
  { label: 'Priority support',      free: false,                 starter: false,                 pro: true },
];

const plans = [
  {
    key: 'free',
    name: 'Anonymous',
    icon: Zap,
    iconColor: 'text-zinc-400',
    iconBg: 'bg-zinc-400/10',
    description: 'Quick and zero-friction. No account needed.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: 'Upload now',
    ctaHref: '/upload',
    highlight: false,
    badge: null,
  },
  {
    key: 'starter',
    name: 'Starter',
    icon: User,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
    description: 'For individuals who want clean links and control.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: 'Create account',
    ctaHref: '/sign-up',
    highlight: true,
    badge: 'Most popular',
  },
  {
    key: 'pro',
    name: 'Pro',
    icon: Sparkles,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-400/10',
    description: 'For power users who need advanced controls.',
    monthlyPrice: 7,
    yearlyPrice: 5,
    cta: 'Get Pro',
    ctaHref: '/sign-up',
    highlight: false,
    badge: 'Coming soon',
  },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="flex items-center justify-center">
        <Check className="h-4 w-4 text-emerald-500" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="flex items-center justify-center">
        <Minus className="h-4 w-4 text-muted-foreground/30" />
      </span>
    );
  }
  return <span className="text-xs text-muted-foreground">{value}</span>;
}

export default function Pricing() {
  const [billing, setBilling] = useState<BillingCycle>('monthly');

  return (
    <section id="pricing" className="py-24 relative overflow-hidden border-t border-border/20 scroll-mt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-accent/5 blur-[100px] -z-10" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">

        {/* Header */}
        <div className="text-left max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3.5 py-1 text-xs font-medium text-foreground mb-5">
            <Sparkles className="h-3 w-3 text-accent" />
            <span>Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Start sharing instantly for free. Upgrade when you need custom links, dashboards, and more control.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/20 p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                billing === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                billing === 'yearly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Yearly
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                −30%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.key}
                className={cn(
                  'relative rounded-2xl border p-7 flex flex-col transition-all duration-300',
                  plan.highlight
                    ? 'border-accent/60 bg-card shadow-[0_0_40px_rgba(0,0,0,0.2),inset_0_0_0_1px_rgba(255,255,255,0.04)] scale-[1.02]'
                    : 'border-border/60 bg-card/60 hover:border-border hover:bg-card'
                )}
              >
                {/* Highlight glow */}
                {plan.highlight && (
                  <div className="absolute inset-0 rounded-2xl bg-accent/3 pointer-events-none" />
                )}

                {/* Badge */}
                {plan.badge && (
                  <div className={cn(
                    'absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border',
                    plan.highlight
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  )}>
                    {plan.badge}
                  </div>
                )}

                <div className="relative">
                  {/* Plan header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn('p-2 rounded-xl', plan.iconBg)}>
                      <Icon className={cn('h-4 w-4', plan.iconColor)} />
                    </div>
                    <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.monthlyPrice === 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-foreground">Free</span>
                        {plan.name === 'Starter' && (
                          <span className="text-sm text-muted-foreground ml-1">forever</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-foreground">${price}</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                        {billing === 'yearly' && (
                          <span className="ml-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            Save 30%
                          </span>
                        )}
                      </div>
                    )}
                    {plan.monthlyPrice > 0 && billing === 'yearly' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Billed ${plan.yearlyPrice * 12}/year
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    href={plan.ctaHref}
                    className={cn(
                      'block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                      plan.highlight
                        ? 'bg-accent text-accent-foreground hover:opacity-90'
                        : plan.key === 'pro'
                        ? 'bg-muted/40 text-muted-foreground border border-border/60 cursor-not-allowed'
                        : 'bg-muted/40 text-foreground border border-border/60 hover:bg-muted/60'
                    )}
                    aria-disabled={plan.key === 'pro'}
                    onClick={(e) => plan.key === 'pro' && e.preventDefault()}
                  >
                    {plan.cta}
                  </Link>

                  {/* Key features */}
                  <ul className="mt-6 space-y-2.5">
                    {features.slice(0, 7).map((f) => {
                      const val = f[plan.key as keyof Feature];
                      if (val === false) return null;
                      return (
                        <li key={f.label} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <span>
                            <span className="text-foreground font-medium">{f.label}</span>
                            {typeof val === 'string' && (
                              <span className="text-muted-foreground"> — {val}</span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <div className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden">
          <div className="grid grid-cols-4 border-b border-border/60 bg-muted/20">
            <div className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Feature</div>
            {plans.map((plan) => (
              <div
                key={plan.key}
                className={cn(
                  'p-4 text-center text-xs font-bold uppercase tracking-widest',
                  plan.highlight ? 'text-accent' : 'text-muted-foreground'
                )}
              >
                {plan.name}
              </div>
            ))}
          </div>

          {features.map((feature, i) => (
            <div
              key={feature.label}
              className={cn(
                'grid grid-cols-4 border-b border-border/30 last:border-0 transition-colors',
                i % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
              )}
            >
              <div className="p-3.5 text-xs text-foreground font-medium flex items-center">
                {feature.label}
              </div>
              {(['free', 'starter', 'pro'] as const).map((planKey) => (
                <div
                  key={planKey}
                  className={cn(
                    'p-3.5 flex items-center justify-center',
                    plans.find(p => p.key === planKey)?.highlight && 'bg-accent/3'
                  )}
                >
                  <FeatureValue value={feature[planKey]} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* FAQ nudge */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Questions about pricing?{' '}
          <Link href="#faq" className="text-foreground font-medium underline-offset-4 hover:underline">
            Check the FAQ
          </Link>
          {' '}or{' '}
          <a href="mailto:hello@snaphost.cloud" className="text-foreground font-medium underline-offset-4 hover:underline">
            contact us
          </a>
          .
        </p>

      </div>
    </section>
  );
}
