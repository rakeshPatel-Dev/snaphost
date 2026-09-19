import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, CreditCard, UserCheck, ArrowRight, Gauge, Tag } from 'lucide-react';
import DashedGrid from '@/components/shared/DashedGrid';
import Container from '@/components/shared/Container';
import SectionHeading from '@/components/shared/SectionHeading';
import ComparisonTable from '@/components/pro/ComparisonTable';
import FAQ from '@/components/landing/FAQ';
import { proFaqs } from '@/data/faq';
import { PREMIUM_FEATURES } from '@/data/PremiumFeatures';
import { EMAILS, mailto } from '@/data/emails';
import Reveal from '@/components/motion/Reveal';

const PRO_PERK_DESCS: Record<string, string> = {
  'Unlimited uploads': 'No daily link caps — share as often as you need.',
  'Password-protected links': 'Gate sensitive files behind a password.',
  'Custom expiry dates': 'Set exact expiration times per file.',
  'Priority CDN': 'Faster delivery and more reliable uptime.',
};

const proPerks = [
  ...PREMIUM_FEATURES.map((f) => ({ ...f, desc: PRO_PERK_DESCS[f.label] })),
  { icon: Tag, label: 'Custom links', desc: 'Pick clean, memorable slugs for every share.' },
  { icon: Gauge, label: '50 MB uploads', desc: 'Five times the free tier file-size limit.' },
];

export default function GetProPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20 sm:pb-32 border-b border-border/30">
        <DashedGrid absolute zIndex={-10} opacity={0.4} />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-150 bg-radial from-accent/10 via-transparent to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="flex flex-col items-start text-left max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-foreground mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span>Get Early Access to Pro</span>
            </div>

            <h1 className="text-4xl sm:text-6xl  font-semibold tracking-tight text-foreground leading-[1.06]">
              Unlock the Full Power of <br className="hidden sm:inline" />
              <span className="text-accent">Snaphost Pro</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Advanced file management, priority support, and expanded storage — all yours on Pro.
            </p>

            <div className="mt-8 flex items-center gap-3.5 flex-wrap">
              <Button asChild size="lg" className="h-11 px-6 cursor-pointer">
                <a href={mailto('billing', 'Pro access request')} className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Request Pro Access
                </a>
              </Button>
              <Button variant="outline" asChild size="lg" className="h-11 px-6 cursor-pointer">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="mb-14">
            <SectionHeading
              title="What you get with Pro"
              description="Every Pro feature, built for sharing files faster and managing them with more control."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proPerks.map(({ icon: Icon, label, desc }, i) => (
              <Reveal key={label} delay={i * 0.06}>
                <div
                  className="rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 transition-all hover:border-accent/40 hover:shadow-[0_30px_80px_-40px_rgba(5,150,105,0.15)]"
                >
                  <div className="p-2 rounded-xl bg-accent/10 w-fit mb-4">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{label}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* How it Works Section */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <Container>
          <div className="mb-14">
            <SectionHeading
              title="How to upgrade to Pro"
              description="We&apos;re currently processing upgrades manually while we build our integrated payment system."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                title: '1. Contact',
                desc: `Send an email to ${EMAILS.billing} or use the feedback form in the footer to let us know you want Pro.`,
              },
              {
                icon: CreditCard,
                title: '2. Payment',
                desc: 'After we connect, you can make the payment via Digital Wallet or Bank Transfer.',
              },
              {
                icon: UserCheck,
                title: '3. Activation',
                desc: 'Once verified, we&apos;ll manually upgrade your account to Pro status instantly.',
              }
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="p-8 rounded-4xl bg-background border border-border/60 transition-all hover:border-accent/40 group">
                  <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 transition-colors group-hover:bg-accent/20">
                    <step.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing Comparison Section */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="mb-14">
            <SectionHeading
              title="Compare plans"
              description="See exactly what Pro unlocks compared to the free and starter tiers."
            />
          </div>
          <Reveal>
            <ComparisonTable highlightKey="pro" />
          </Reveal>
        </Container>
      </section>

      {/* Requirements Section */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <Container>
          <div className="mb-14">
            <SectionHeading
              title="What to provide for access"
              description="A short checklist so we can activate your Pro account on the first pass."
            />
          </div>

          <Reveal className="rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-8 sm:p-10">
            <ul className="space-y-4">
              {[
                { label: 'Account Email', desc: 'The email address associated with your Snaphost account.' },
                { label: 'Payment Proof', desc: 'A screenshot of the transaction or the transaction ID.' },
                { label: 'Contact Info', desc: 'Your name and any specific requirements you have.' },
              ].map((item, i) => (
                <li key={i} className="flex gap-4 p-4 rounded-2xl bg-background border border-border/60 transition-colors hover:border-accent/30">
                  <div className="h-6 w-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <span className="font-medium block text-foreground">{item.label}</span>
                    <span className="text-sm text-muted-foreground">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      {/* FAQ Section */}
      <FAQ
        items={proFaqs}
        title="Pro access, in plain terms"
        description="A few questions people ask before requesting Pro."
      />

      {/* Closing CTA */}
      <section className="py-20 sm:py-24">
        <Container>
          <Reveal className="relative rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-8 sm:p-12 text-left shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] overflow-hidden">
            <div className="absolute -top-24 left-1/4 w-[80vw] max-w-[600px] h-96 rounded-full bg-accent/5 blur-[80px] pointer-events-none -z-10" />

            <div className="max-w-2xl">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
                Ready to go <span className="text-accent">Pro</span>?
              </h3>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                Email us and we&apos;ll get you set up with unlimited uploads, custom controls, and priority support.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Button asChild size="lg" className="rounded-full h-11 px-6 font-medium text-sm cursor-pointer">
                  <a href={mailto('billing', 'Pro access request')} className="flex items-center gap-2">
                    Request Pro Access <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild size="lg" className="rounded-full h-11 px-6 font-medium text-sm cursor-pointer">
                  <Link href="/sign-up">Create free account</Link>
                </Button>
              </div>

              <p className="mt-6 text-xs text-muted-foreground font-medium">
                Free tier stays free • Manual activation within 24 hours • No recurring billing
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <footer className="py-12 text-center text-muted-foreground text-sm border-t border-border/30">
        <p>© {new Date().getFullYear()} Snaphost. All rights reserved.</p>
      </footer>
    </div>
  );
}