"use client";

import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, UserRound, LogOut, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';
import DeleteAccountDialog from '@/components/shared/DeleteAccountDialog';
import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';

export default function HeaderMobile() {
    const [open, setOpen] = useState(false);
    const [accountDeleteOpen, setAccountDeleteOpen] = useState(false);
    const { isSignedIn, signOut } = useAuth();

    async function handleSignOut() {
        try {
            await signOut();
            setOpen(false);
            window.location.href = '/';
        } catch {
        }
    }

    const navLinks = [
        { name: 'Features', href: '/#features' },
        { name: 'Pricing', href: '/#pricing' },
        { name: 'FAQ', href: '/#faq' },
        { name: 'Company', href: '/company' },
        { name: 'Upload', href: '/upload' },
        ...(isSignedIn ? [{ name: 'Profile Dashboard', href: '/profile' }] : []),
    ];

    return (
        <div className="md:hidden flex items-center gap-2">
            <AnimatedThemeToggler className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer" />

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                        <Menu className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0 bg-background/95 backdrop-blur-xl border-border/60">
                    <SheetHeader className="border-b border-border/50 px-5 py-4">
                        <SheetTitle className="text-left text-base font-semibold tracking-tight">
                            <Link href="/" onClick={() => setOpen(false)}>snaphost</Link>
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-col gap-1 p-4">
                        <p className="px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Navigation</p>
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                            >
                                {item.name}
                            </Link>
                        ))}

                        <Separator className="my-3" />

                        {!isSignedIn ? (
                            <div className="flex flex-col gap-2.5 px-1 pt-1">
                                <Button size="sm" className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90" asChild>
                                    <Link href="/sign-in" onClick={() => setOpen(false)}>Sign in</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 px-1 pt-1">
                                <Button variant="outline" size="sm" className="w-full rounded-full" asChild>
                                    <Link href="/profile" onClick={() => setOpen(false)}>
                                        <UserRound className="h-3.5 w-3.5" />
                                        Profile
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="w-full rounded-full" onClick={handleSignOut}>
                                    <LogOut className="h-3.5 w-3.5" />
                                    Sign out
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                                    onClick={() => setAccountDeleteOpen(true)}
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    Delete account
                                </Button>
                                <DeleteAccountDialog trigger={null} open={accountDeleteOpen} onOpenChange={setAccountDeleteOpen} />
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
