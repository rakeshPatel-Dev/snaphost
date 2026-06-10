import { BentoGrid, CTA, FAQ, Hero, LogoCloud, Pricing } from '@/features/landing';

export default function Home() {
  return (
    <main className="flex flex-col">
      <Hero />
      <LogoCloud />
      <BentoGrid />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
  );
}
