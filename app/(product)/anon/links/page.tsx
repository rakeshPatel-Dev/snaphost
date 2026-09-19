import { AnonLinks } from '@/features/upload';
import Container from '@/components/shared/Container';

export const metadata = {
  title: 'Anonymous links',
};

export default function Page() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
          Your anonymous links
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Links from anonymous uploads expire after 24 hours.
        </p>

        <div className="mt-8 rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-4 sm:p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)]">
          <AnonLinks />
        </div>
      </div>
    </Container>
  );
}
