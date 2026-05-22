import Hero from '@/components/landing/Hero';
import LogoCloud from '@/components/landing/LogoCloud';
import BentoGrid from '@/components/landing/BentoGrid';
import FAQ from '@/components/landing/FAQ';
import CTA from '@/components/landing/CTA';

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
