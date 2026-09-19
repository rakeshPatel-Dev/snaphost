'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, Zap, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Container from '@/components/shared/Container';
import SectionHeading from '@/components/shared/SectionHeading';
import { Button } from '@/components/ui/button';
import { useTier } from '@/lib/useTier';
import { features, type Feature } from '@/data/pricing';
import { mailto } from '@/data/emails';
import Reveal from '@/components/motion/Reveal';

type BillingCycle = 'monthly' | 'yearly';

const plans = [
  {
    key: 'free',
    name: 'Anonymous',
    icon: Zap,
    iconColor: 'text-muted-foreground',
    iconBg: 'bg-muted/30',
    description: 'No account needed. Upload and share instantly.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: 'Upload now',
    ctaHref: '#dropzone',
    highlight: false,
    badge: null,
  },
  {
    key: 'starter',
    name: 'Starter',
    icon: User,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
    description: 'Clean links plus control over names and expiry.',
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
    iconColor: 'text-muted-foreground',
    iconBg: 'bg-muted/30',
    description: 'Advanced controls, domains, analytics, and API.',
    monthlyPrice: 7,
    yearlyPrice: 5,
    cta: 'Get Pro',
    ctaHref: '/getpro',
    highlight: false,
    badge: 'Coming soon',
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const { isPremium } = useTier();
  return (
    <section id="pricing" className="py-20 sm:py-24 relative overflow-hidden border-t border-border/50 scroll-mt-16">
      <Container>
        <div className="mb-14">
          <SectionHeading
            title="Simple, transparent pricing"
            description="Upload and share anonymously for free. Upgrade when you need custom links, a dashboard, and more control."
          />

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/20 p-1">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              aria-pressed={billing === 'monthly'}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
                billing === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling('yearly')}
              aria-pressed={billing === 'yearly'}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer',
                billing === 'yearly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Yearly
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                −30%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const price = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <Reveal key={plan.key} delay={i * 0.08}>
              <div
                className={cn(
                  'relative rounded-4xl border bg-card/80 backdrop-blur-xl p-7 flex flex-col transition-all duration-300 h-full',
                  plan.highlight
                    ? 'border-accent/60 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] md:scale-[1.02]'
                    : 'border-border/60 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] hover:border-border'
                )}
              >
                {/* Badge */}
                {(plan.badge || (plan.key === 'pro' && isPremium)) && (
                  <div className={cn(
                    'absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border',
                    plan.key === 'pro' && isPremium
                      ? 'premium-gradient text-white border-transparent'
                      : plan.highlight
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-muted/30 text-muted-foreground border-border/60'
                  )}>
                    {plan.key === 'pro' && isPremium ? 'Current plan' : plan.badge}
                  </div>
                )}

                <div className="relative">
                  {/* Plan header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn('p-2 rounded-xl', plan.iconBg)}>
                      <Icon className={cn('h-4 w-4', plan.iconColor)} />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.monthlyPrice === 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-semibold text-foreground">Free</span>
                        {plan.name === 'Starter' && (
                          <span className="text-sm text-muted-foreground ml-1">forever</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-semibold text-foreground">${price}</span>
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
                  {plan.key === 'pro' && isPremium ? (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full h-11 px-6 rounded-full font-medium text-sm cursor-pointer border-amber-400/30 text-amber-500 hover:bg-amber-400/10 hover:text-amber-500"
                    >
                      <Link href="/profile">Manage plan</Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full h-11 px-6 rounded-full font-medium text-sm cursor-pointer">
                      <Link href={plan.ctaHref}>{plan.cta}</Link>
                    </Button>
                  )}

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
              </Reveal>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Questions about pricing?{' '}
          <Link href="#faq" className="text-foreground font-medium underline-offset-4 hover:underline">
            Check the FAQ
          </Link>
          {' '}or{' '}
          <a href={mailto('billing', 'Pricing question')} className="text-foreground font-medium underline-offset-4 hover:underline">
            contact us
          </a>
          .
        </p>

      </Container>
    </section>
  );
}