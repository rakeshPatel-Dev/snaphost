'use client';

import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs';

export default function ClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInForceRedirectUrl="/profile"
      signUpForceRedirectUrl="/profile"
      signInFallbackRedirectUrl="/profile"
      signUpFallbackRedirectUrl="/profile"
    >
      {children}
    </BaseClerkProvider>
  );
}
