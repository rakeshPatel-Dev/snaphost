'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { headerNavs, navButtons } from '@/data/header';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-card/90 backdrop-blur-md border-b border-border'
          : 'bg-card border-b border-border'
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity"
          >
            SnapHost
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {headerNavs.map((nav) => (
              <Link
                key={nav.name}
                href={nav.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
                  isActive(nav.href)
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {nav.name}
              </Link>
            ))}
          </nav>

          {/* buttons */}
            {navButtons.map((button) => (
                <Link
                  key={button.name}
                  href={button.href}
                >
                    <Button className="ml-2">{button.name}</Button>
                </Link>)
            )}


          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-card border-border">
                <SheetHeader className="border-b border-border pb-4">
                  <SheetTitle className="text-left text-foreground">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  {headerNavs.map((nav) => (
                    <Link
                      key={nav.name}
                      href={nav.href}
                      className={cn(
                        'px-4 py-3 text-sm font-medium rounded-md transition-all duration-200',
                        isActive(nav.href)
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      {nav.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}