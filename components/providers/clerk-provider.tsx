'use client';

import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs';
import { ui } from '@clerk/ui';

export default function ClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInForceRedirectUrl="/auth/sync"
      signUpForceRedirectUrl="/auth/sync"
      signInFallbackRedirectUrl="/auth/sync"
      signUpFallbackRedirectUrl="/auth/sync"
      ui={ui}
    >
      {children}
    </BaseClerkProvider>
  );
}
