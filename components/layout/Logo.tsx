'use client';

import Link from 'next/link';
import SnaphostLogo from '../icons/SnaphostLogo';

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`group flex shrink-0 items-center gap-2.5 ${className ?? ''}`}>
      <SnaphostLogo color="currentColor" className="h-5 w-5 text-foreground transition-transform group-hover:scale-105" />
      <span className="font-semibold tracking-tight text-foreground text-base sm:text-lg">
        snaphost
      </span>
    </Link>
  );
}
