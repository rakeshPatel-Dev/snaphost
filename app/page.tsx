import { BentoGrid, CTA, FAQ, Hero, LogoCloud } from '@/features/landing';

export default function Home() {
  return (
    <main className="flex flex-col">
      <Hero />
      <LogoCloud />
      <BentoGrid />
      <FAQ />
      <CTA />
    </main>
  );
}
