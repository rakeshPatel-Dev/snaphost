'use client';

import { Check, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import Container from '@/components/shared/Container';
import SectionHeading from '@/components/shared/SectionHeading';
import MotionPreview from '@/components/motion/MotionPreview';
import Reveal from '@/components/motion/Reveal';
import { motionScenes } from '@/components/motion';
import { features } from '@/data/features';
import { Button } from '../ui/button';

export default function FeatureShowcase() {
  return (
    <section id="features" className="relative scroll-mt-16 overflow-hidden py-20 sm:py-24">
      <Container>
        <SectionHeading
          title="Everything you need for fast file sharing"
          description="Direct share links, original-file uploads, and a dashboard built for clean, fast sharing."
        />

        <div className="mt-14 space-y-14 sm:space-y-20">
          {features.map((feature, index) => {
            const Scene = motionScenes[feature.id];
            const reverse = index % 2 === 1;

            return (
              <div
                key={feature.id}
                className="grid items-center gap-6 md:grid-cols-2 md:gap-12 lg:gap-16"
              >
                <Reveal
                  y={24}
                  className={cn('min-w-0', reverse && 'md:order-2')}
                >
                  <MotionPreview>{(t) => <Scene t={t} />}</MotionPreview>
                </Reveal>

                <Reveal
                  y={24}
                  delay={0.1}
                  className={cn(reverse && 'md:order-1')}
                >
                  <div className="flex items-center gap-3">
                    {/* <span className="flex h-8 min-w-8 items-center justify-center rounded-full border border-border/60 bg-muted/20 font-mono text-xs font-semibold text-muted-foreground">
                      {feature.eyebrow}
                    </span> */}
                    <Button>
                      { feature.eyebrow}
                    </Button>
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {feature.requiresAccount ? (
                    <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                      <UserRound className="h-3.5 w-3.5" />
                      For registered users
                    </span>
                  ) : null}
                </Reveal>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
