'use client'

import SnaphostLogo from '@/components/icons/SnaphostLogo'
import { cn } from '@/lib/utils'

interface BrandLoaderProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-6',
  md: 'size-10',
  lg: 'size-14',
} as const

export default function BrandLoader({
  label = 'Loading',
  size = 'md',
  className,
}: BrandLoaderProps) {
  return (
    <div className={cn('flex items-center justify-center text-accent', className)} role="status">
      <span className={cn('brand-loader-mark block', sizeClasses[size])}>
        <SnaphostLogo className="size-full" color="currentColor" />
      </span>
      <span className="sr-only">{label}</span>
    </div>
  )
}
