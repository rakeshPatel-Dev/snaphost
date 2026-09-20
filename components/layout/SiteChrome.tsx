'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BetaBanner from '@/components/beta/BetaBanner';
import type { SiteChromeProps } from '@/types/components';

export default function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const isFileViewRoute =
    pathname.startsWith('/f/') ||
    pathname.startsWith('/anon/') ||
    (/^\/[^/]+\/[^/]+$/.test(pathname) && !pathname.startsWith('/company/'));

  if (
    isFileViewRoute ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/check-email') ||
    pathname.startsWith('/auth/sync')
  ) {
    return <>{children}</>;
  }

  return (
    <>
      <BetaBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}