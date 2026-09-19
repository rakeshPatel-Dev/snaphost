'use client';

import { SiNextdotjs, SiSupabase, SiUmami, SiUpstash, SiVercel } from 'react-icons/si';
import Container from '@/components/shared/Container';
import Reveal from '@/components/motion/Reveal';
import SectionHeading from '@/components/shared/SectionHeading';

const stack = [
  { name: 'Next.js', Icon: SiNextdotjs },
  { name: 'Supabase', Icon: SiSupabase },
  { name: 'Upstash', Icon: SiUpstash },
  { name: 'Vercel', Icon: SiVercel },
  { name: 'Umami', Icon: SiUmami },
] as const;

export default function LogoCloud() {
  return (
    <section className="border-b border-border/30 py-16 sm:py-20">
      <Container>
        <SectionHeading title="Built on a dependable stack" />

        <div className="mt-10 flex flex-wrap items-center gap-x-9 gap-y-5 border-y border-border/50 py-7 sm:mt-12 sm:gap-x-14 sm:py-8">
          {stack.map(({ name, Icon }, index) => (
            <Reveal
              key={name}
              delay={index * 0.05}
              className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-base font-semibold tracking-tight">{name}</span>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
