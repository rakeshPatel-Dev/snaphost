'use client';

import Link from 'next/link';
import Logo from './Logo';
import { Camera, Upload, Menu, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserButton, useUser } from '@clerk/nextjs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { BsGithub } from 'react-icons/bs';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';
import { UserRound, Trash2 } from 'lucide-react';
import DeleteAccountDialog from '@/components/shared/DeleteAccountDialog';

const navItems = [
  { name: 'Upload', href: '/upload' },
  { name: 'Sign up', href: '/sign-up' },
  { name: 'Profile', href: '/profile' },
];

const features = [
  {
    title: 'Anonymous upload',
    description: 'Drop a file and get a share link instantly without creating an account.',
    icon: Upload,
    href: '/upload',
  },
  {
    title: 'Profile dashboard',
    description: 'Signed-in users can rename files, change slugs, and manage expiration.',
    icon: Camera,
    href: '/profile',
  },
  {
    title: 'Clean share links',
    description: 'Public URLs follow the new baseurl/username/filename pattern for signed-in uploads.',
    icon: Sparkles,
    href: '/upload',
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [accountDeleteOpen, setAccountDeleteOpen] = useState(false);
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      {/* Announcement bar */}
      <div className="flex items-center justify-center gap-2 bg-background/80 px-4 py-1.5 text-xs text-muted-foreground border-b border-border/40">
        <Sparkles className="h-3 w-3 text-primary" />
        <span>
          Introducing{' '}
          <Link href="/upload" className="font-semibold text-foreground underline-offset-4 hover:underline">
            SnapHost 2.0
          </Link>{' '}
          — cleaner links, faster uploads.
        </span>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
          New
        </Badge>
      </div>

      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Logo />

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <ul className="flex items-center gap-1">
            {/* Features Dropdown */}
            <li className="relative">
              <button
                onClick={() => setShowFeatures(!showFeatures)}
                onBlur={() => setTimeout(() => setShowFeatures(false), 200)}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Product
                <svg
                  className={`h-3 w-3 transition-transform ${showFeatures ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showFeatures && (
                <div className="absolute left-0 top-full mt-1 w-105 rounded-md border border-border bg-background shadow-lg">
                  <ul className="p-3 space-y-1">
                    {features.map((feature) => (
                      <li key={feature.title}>
                        <Link
                          href={feature.href}
                          className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-accent"
                        >
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                            <feature.icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div>
                            <div className="text-[13px] font-medium text-foreground">
                              {feature.title}
                            </div>
                            <p className="text-[12px] text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>

            {/* Regular nav items */}
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <AnimatedThemeToggler/>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground" asChild>
            <a href="https://github.com/snaphost" target="_blank" rel="noopener noreferrer">
              <BsGithub className="h-3.5 w-3.5" />
              <span className="text-xs">GitHub</span>
            </a>
          </Button>

          <Separator orientation="vertical" className="h-4" />

          {!isSignedIn ? (
            <>
              <Button variant="ghost" size="sm" className="h-8 text-sm" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>

              <Button size="sm" className="h-8 gap-1.5 text-sm shadow-sm" asChild>
                <Link href="/signup">
                  <Upload className="h-3.5 w-3.5" />
                  Start uploading
                </Link>
              </Button>
            </>
          ) : (
            <>
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link href="/profile" label="View profile" labelIcon={<UserRound className="h-4 w-4" />} />
                  <UserButton.Action
                    label="Delete account"
                    labelIcon={<Trash2 className="h-4 w-4" />}
                    onClick={() => setAccountDeleteOpen(true)}
                  />
                </UserButton.MenuItems>
              </UserButton>
              <DeleteAccountDialog
                trigger={null}
                open={accountDeleteOpen}
                onOpenChange={setAccountDeleteOpen}
              />
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-70 p-0">
              <SheetHeader className="border-b border-border px-4 py-3">
                <SheetTitle className="flex items-center gap-2 text-left text-[15px]">
                  <Logo />
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-0.5 p-3">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Product
                </p>
                {features.map((feature) => (
                  <Link
                    key={feature.title}
                    href={feature.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <feature.icon className="h-4 w-4 shrink-0 text-primary" />
                    {feature.title}
                  </Link>
                ))}

                <Separator className="my-2" />

                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {item.name}
                  </Link>
                ))}

                <Separator className="my-2" />

                <div className="flex items-center justify-between px-2">
                  <a
                    href="https://github.com/snaphost"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <BsGithub className="h-4 w-4" />
                    GitHub
                  </a>
                  <AnimatedThemeToggler className="hover:bg-accent rounded-lg" />
                </div>

                <Separator className="my-2" />

                {!isSignedIn ? (
                  <div className="flex flex-col gap-2 px-1">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/sign-in" onClick={() => setMobileOpen(false)}>Sign in</Link>
                    </Button>
                    <Button size="sm" className="w-full gap-1.5" asChild>
                      <Link href="/signup" onClick={() => setMobileOpen(false)}>
                        <Upload className="h-3.5 w-3.5" />
                        Start uploading
                      </Link>
                    </Button>
                  </div>
                ) : null}

                {isSignedIn ? (
                  <div className="flex flex-col gap-2 px-1">
                    <div className="flex justify-center py-2">
                      <UserButton>
                        <UserButton.MenuItems>
                          <UserButton.Link href="/profile" label="View profile" labelIcon={<UserRound className="h-4 w-4" />} />
                            <UserButton.Action
                              label="Delete account"
                              labelIcon={<Trash2 className="h-4 w-4" />}
                              onClick={() => setAccountDeleteOpen(true)}
                            />
                        </UserButton.MenuItems>
                      </UserButton>
                        <DeleteAccountDialog
                          trigger={null}
                          open={accountDeleteOpen}
                          onOpenChange={setAccountDeleteOpen}
                        />
                    </div>
                  </div>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}