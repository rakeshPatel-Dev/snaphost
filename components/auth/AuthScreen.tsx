'use client';

import AuthForm from '@/components/auth/AuthForm';
import Container from '@/components/shared/Container';
import DashedGrid from '@/components/shared/DashedGrid';
import Logo from '@/components/layout/Logo';

type AuthScreenProps = {
  mode: 'sign-in' | 'sign-up';
};

export default function AuthScreen({ mode }: AuthScreenProps) {
  return (
    <div className="relative isolate overflow-hidden bg-background text-foreground">
      {/* Background dashed grid */}
      <DashedGrid absolute zIndex={-1} opacity={0.4} />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-150 w-full max-w-5xl -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />

      <Container className="relative flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center">
            <Logo />
          </div>
          <AuthForm mode={mode} />
        </div>
      </Container>
    </div>
  );
}