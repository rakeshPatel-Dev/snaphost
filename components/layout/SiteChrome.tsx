'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { SiteChromeProps } from '@/types/components';

export default function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const isFileViewRoute =
    pathname.startsWith('/f/') ||
    pathname.startsWith('/anon/') ||
    /^\/[^/]+\/[^/]+$/.test(pathname);

  if (
    isFileViewRoute ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/auth/sync')
  ) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}