'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BrandLoaderProps {
  label?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  xs: 'size-4',
  sm: 'size-6',
  md: 'size-10',
  lg: 'size-14',
} as const

const sizePixels = {
  xs: 16,
  sm: 24,
  md: 40,
  lg: 56,
} as const

export default function BrandLoader({
  label = 'Loading',
  size = 'md',
  className,
}: BrandLoaderProps) {
  return (
    <div className={cn('flex items-center justify-center text-accent', className)} role="status">
      <span className={cn('block', sizeClasses[size])}>
        <Image
          src="/sh_spinner.gif"
          alt=""
          aria-hidden="true"
          width={sizePixels[size]}
          height={sizePixels[size]}
          loading="eager"
          unoptimized
          className="size-full object-contain"
        />
      </span>
      <span className="sr-only">{label}</span>
    </div>
  )
}
