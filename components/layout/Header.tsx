'use client';

import Link from 'next/link';
import Logo from './Logo';
import { Camera, Upload,  Menu, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { BsGithub } from 'react-icons/bs';
import Image from 'next/image';

const features = [
  {
    title: 'Instant Upload',
    description: 'Drag & drop or paste images directly. Ready in seconds.',
    icon: Upload,
    href: '/upload',
  },
  {
    title: 'Smart Hosting',
    description: 'Global CDN, auto-compression, and WebP conversion built in.',
    icon: Camera,
    href: '/hosting',
  },
  {
    title: 'Shareable Links',
    description: 'One-click sharing with expiry, password protection, and analytics.',
    icon: Sparkles,
    href: '/sharing',
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      {/* Announcement bar */}
      <div className="flex items-center justify-center gap-2 bg-primary/5 px-4 py-1.5 text-xs text-muted-foreground border-b border-border/40">
        <Sparkles className="h-3 w-3 text-primary" />
        <span>
          Introducing{' '}
          <Link href="/changelog" className="font-semibold text-foreground underline-offset-4 hover:underline">
            SnapHost 2.0
          </Link>{' '}
          — faster uploads, smarter CDN.
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
          <NavigationMenu>
            <NavigationMenuList className="gap-0.5">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-8 text-sm font-medium text-muted-foreground data-[state=open]:text-foreground bg-transparent hover:bg-accent/60">
                  Product
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[420px] gap-1 p-3">
                    {features.map((feature) => (
                      <ListItem
                        key={feature.title}
                        href={feature.href}
                        title={feature.title}
                        icon={feature.icon}
                      >
                        {feature.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {['Pricing', 'Docs', 'Blog'].map((item) => (
                <NavigationMenuItem key={item}>
                  <Link href={`/${item.toLowerCase()}`} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'h-8 text-sm font-medium text-muted-foreground hover:text-foreground bg-transparent hover:bg-accent/60'
                      )}
                    >
                      {item}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground" asChild>
            <a href="https://github.com/snaphost" target="_blank" rel="noopener noreferrer">
              <BsGithub className="h-3.5 w-3.5" />
              <span className="text-xs">GitHub</span>
            </a>
          </Button>

          <Separator orientation="vertical" className="h-4" />

          <Button variant="ghost" size="sm" className="h-8 text-sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>

          <Button size="sm" className="h-8 gap-1.5 text-sm shadow-sm" asChild>
            <Link href="/signup">
              <Upload className="h-3.5 w-3.5" />
              Start uploading
            </Link>
          </Button>
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
            <SheetContent side="right" className="w-[280px] p-0">
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

                {['Pricing', 'Docs', 'Blog'].map((item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {item}
                  </Link>
                ))}

                <a
                  href="https://github.com/snaphost"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <BsGithub className="h-4 w-4" />
                  GitHub
                </a>

                <Separator className="my-2" />

                <div className="flex flex-col gap-2 px-1">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
                  </Button>
                  <Button size="sm" className="w-full gap-1.5" asChild>
                    <Link href="/signup" onClick={() => setMobileOpen(false)}>
                      <Upload className="h-3.5 w-3.5" />
                      Start uploading
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

function ListItem({
  title,
  children,
  href,
  icon: Icon,
  className,
}: {
  title: string;
  children: React.ReactNode;
  href: string;
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            'group flex select-none items-start gap-3 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
        >
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background shadow-sm transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <div className="mb-0.5 text-[13px] font-medium leading-none text-foreground">
              {title}
            </div>
            <p className="text-[12px] leading-snug text-muted-foreground">
              {children}
            </p>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}