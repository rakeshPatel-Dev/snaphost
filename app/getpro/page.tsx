import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, CreditCard, UserCheck, ArrowRight } from 'lucide-react';
import DashedGrid from '@/components/shared/DashedGrid';

export default function GetProPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20 sm:pb-32 border-b border-border/30">
        <DashedGrid absolute zIndex={-10} opacity={0.4} />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-150 bg-radial from-accent/10 via-transparent to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="container max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 hover:bg-muted/40 px-3.5 py-1.5 text-xs font-medium text-foreground transition-all mb-8 group">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span>Get Early Access to Pro</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-foreground leading-[1.06] mb-6">
            Unlock the Full Power of <br className="hidden sm:inline" />
            <span className="text-foreground/90">Snaphost Pro</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Snaphost Pro is here with advanced file management,
            priority support, and enhanced storage limits. Upgrade your account today.
          </p>

          <div className="flex flex-wrap justify-center gap-3.5">
            <Button asChild size="lg" className="h-11 px-6 cursor-pointer">
              <a href="mailto:dev@rakeshpatel.me" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Request Pro Access
              </a>
            </Button>
            <Button variant="outline" asChild size="lg" className="h-11 px-6 cursor-pointer">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
              How to upgrade to Pro
            </h2>
            <p className="text-muted-foreground">
              We&apos;re currently processing upgrades manually while we build our integrated payment system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                title: '1. Contact',
                desc: 'Send an email to dev@rakeshpatel.me or use the feedback form in the footer to let us know you want Pro.',
                color: 'text-accent'
              },
              {
                icon: CreditCard,
                title: '2. Payment',
                desc: 'After we connect, you can make the payment via Digital Wallet or Bank Transfer.',
                color: 'text-accent'
              },
              {
                icon: UserCheck,
                title: '3. Activation',
                desc: 'Once verified, we&apos;ll manually upgrade your account to Pro status instantly.',
                color: 'text-accent'
              }
            ].map((step, i) => (
              <div key={i} className="p-8 rounded-2xl bg-background border border-border/60 flex flex-col items-center text-center transition-all hover:border-accent/50 group">
                <div className={`h-12 w-12 rounded-full bg-muted group-hover:bg-accent/10 flex items-center justify-center mb-6 transition-colors ${step.color}`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 sm:py-32">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="p-8 sm:p-12 rounded-3xl bg-muted/50 border border-border/60 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <UserCheck className="h-24 w-24 text-accent" />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-8 flex items-center gap-2">
                What to provide for access
                <ArrowRight className="h-5 w-5 text-accent" />
              </h2>

              <ul className="space-y-4">
                {[
                  { label: 'Account Email', desc: 'The email address associated with your Snaphost account.' },
                  { label: 'Payment Proof', desc: 'A screenshot of the transaction or the transaction ID.' },
                  { label: 'Contact Info', desc: 'Your name and any specific requirements you have.' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 p-4 rounded-xl bg-background border border-border/60 transition-colors hover:border-accent/30">
                    <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <span className="font-medium block text-foreground">{item.label}</span>
                      <span className="text-sm text-muted-foreground">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center text-muted-foreground text-sm border-t border-border/30">
        <p>© {new Date().getFullYear()} Snaphost. All rights reserved.</p>
      </footer>
    </div>
  );
}
