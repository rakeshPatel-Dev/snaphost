import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export default function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-5xl px-4 sm:px-6', className)}>
      {children}
    </div>
  );
}
