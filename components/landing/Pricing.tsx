'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, Minus, Zap, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Container from '@/components/shared/Container';
import SectionHeading from '@/components/shared/SectionHeading';
import { Button } from '@/components/ui/button';

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
  { label: 'Delete uploads',        free: true,                  starter: true,                  pro: true },
  { label: 'Custom expiry rules',   free: false,                 starter: true,                  pro: true },
  { label: 'Password-protected links', free: false,              starter: false,                 pro: 'Coming soon' },
  { label: 'Custom domain',         free: false,                 starter: false,                 pro: 'Coming soon' },
  { label: 'Upload analytics',      free: false,                 starter: false,                 pro: 'Coming soon' },
  { label: 'Priority support',      free: false,                 starter: false,                 pro: true },
];

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
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.key}
                className={cn(
                  'relative rounded-4xl border bg-card/80 backdrop-blur-xl p-7 flex flex-col transition-all duration-300',
                  plan.highlight
                    ? 'border-accent/60 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] md:scale-[1.02]'
                    : 'border-border/60 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] hover:border-border'
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={cn(
                    'absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border',
                    plan.highlight
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-muted/30 text-muted-foreground border-border/60'
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
                  <Button
                    asChild
                    className="w-full h-11 px-6 rounded-full font-medium text-sm cursor-pointer"
                  >
                    <Link href={plan.ctaHref}>{plan.cta}</Link>
                  </Button>

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
        <div className="rounded-4xl border border-border/60 bg-card/80 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-4 border-b border-border/60 bg-muted/20">
            <div className="p-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Feature</div>
            {plans.map((plan) => (
              <div
                key={plan.key}
                className={cn(
                  'p-4 sm:text-center text-xs font-semibold uppercase tracking-widest',
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
                'grid grid-cols-1 sm:grid-cols-4 border-b border-border/30 last:border-0 transition-colors md:items-center',
                i % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
              )}
            >
              <div className="p-3.5 text-xs text-foreground font-medium">{feature.label}</div>
              {(['free', 'starter', 'pro'] as const).map((planKey, j) => (
                <div
                  key={planKey}
                  className={cn(
                    'p-3.5 flex items-center justify-between sm:justify-center gap-3',
                    j === 0 ? 'border-t border-border/30 sm:border-0' : '',
                    plans.find(p => p.key === planKey)?.highlight && 'sm:bg-accent/3'
                  )}
                >
                  <span className="sm:hidden text-xs text-muted-foreground">
                    {plans.find(p => p.key === planKey)?.name}
                  </span>
                  <FeatureValue value={feature[planKey]} />
                </div>
              ))}
            </div>
          ))}
        </div>

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

      </Container>
    </section>
  );
}