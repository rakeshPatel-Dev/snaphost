import React from 'react'
import Link from 'next/link'

type ProfileLinkProps = {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  asButton?: boolean;
  className?: string;
}

export default function ProfileLink({ href, onClick, children, asButton = false, className = '' }: ProfileLinkProps) {
  if (asButton || !href) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}
