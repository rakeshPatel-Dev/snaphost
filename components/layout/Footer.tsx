'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { copyrightText, footerLinks, companyLinks } from '@/data/footer'
import Container from '@/components/shared/Container'
import Logo from './Logo'
import SocialButtons from './SocialButtons'
import FeedbackDialog from '../shared/FeedbackDialog'
import { FOUNDER_SITE } from '@/data/emails'

const productLinks = [
  { label: 'Upload', href: '/upload' },
  { label: 'Sign up', href: '/sign-up' },
  { label: 'Sign in', href: '/sign-in' },
  { label: 'Dashboard', href: '/profile' },
]

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-card/40">
      <Container>
        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Upload an image or PDF and get a clean, shareable link in seconds — no account
              required.
            </p>
            <SocialButtons />
          </div>

          <div className="flex flex-col gap-3 lg:col-span-3 lg:col-start-7">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
              Product
            </p>
            <ul className="flex flex-col gap-2.5">
              {productLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 lg:col-span-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
              Support
            </p>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-1">
              <FeedbackDialog />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border/50 py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">{copyrightText}</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {companyLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Made with <Heart className="h-3 w-3 fill-accent text-accent" /> by{' '}
            <a
              href={FOUNDER_SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
              Rakesh Patel
            </a>
          </p>
        </div>
      </Container>
    </footer>
  )
}
