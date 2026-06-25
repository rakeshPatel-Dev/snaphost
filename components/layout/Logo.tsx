'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`group flex shrink-0 items-center  gap-2.5 ${className ?? ''}`}>
      <Image
        src="/images/snaphost-light.png"
        alt="logo"
        width={32}
        height={32}
        className="h-10 w-10 items-center justify-center rounded-lg  transition-transform group-hover:scale-105"
      />
      <span className="font-semibold tracking-tight text-foreground text-xl">
        Snap<span className="text-accent">Host</span>
      </span>
    </Link>
  );
}
