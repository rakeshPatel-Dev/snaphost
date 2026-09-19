import { FeatureShowcase, CTA, FAQ, Hero, LogoCloud, Pricing } from '@/features/landing';

export default function Home() {
  return (
    <main className="flex flex-col">
      <Hero />
      <LogoCloud />
      <FeatureShowcase />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
  );
}
