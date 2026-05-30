"use client";

import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { BsGithub } from 'react-icons/bs';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';
import { Upload, UserRound, LogOut, Trash2 } from 'lucide-react';
import DeleteAccountDialog from '@/components/shared/DeleteAccountDialog';
import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { getHeaderNavItems } from './header-nav-items';

const features = [
    { title: 'Anonymous upload', href: '/upload', icon: Upload },
    { title: 'Profile dashboard', href: '/profile', icon: UserRound },
];

export default function HeaderMobile() {
    const [open, setOpen] = useState(false);
    const [accountDeleteOpen, setAccountDeleteOpen] = useState(false);
    const { isSignedIn, signOut } = useAuth();
    const navItems = getHeaderNavItems(isSignedIn);

    async function handleSignOut() {
        try {
            await signOut();
            setOpen(false);
            window.location.href = '/';
        } catch {
        }
    }

    return (
        <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Menu className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-70 p-0">
                    <SheetHeader className="border-b border-border px-4 py-3">
                        <SheetTitle className="flex items-center gap-2 text-left text-[15px]"> <Link href="/">Snaphost</Link> </SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-col gap-0.5 p-3">
                        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Product</p>
                        {features.map((feature) => (
                            <Link key={feature.title} href={feature.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                                <feature.icon className="h-4 w-4 shrink-0 text-primary" />
                                {feature.title}
                            </Link>
                        ))}

                        <Separator className="my-2" />

                        {navItems.map((item) => (
                            <Link key={item.name} href={item.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                                {item.name}
                            </Link>
                        ))}

                        <Separator className="my-2" />

                        <div className="flex items-center justify-between px-2">
                            <a href="https://github.com/snaphost" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                                <BsGithub className="h-4 w-4" />
                                GitHub
                            </a>
                            <AnimatedThemeToggler className="hover:bg-accent rounded-lg" />
                        </div>

                        <Separator className="my-2" />

                        {!isSignedIn ? (
                            <div className="flex flex-col gap-2 px-1">
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                    <Link href="/sign-in" onClick={() => setOpen(false)}>Sign in</Link>
                                </Button>
                                <Button size="sm" className="w-full gap-1.5" asChild>
                                    <Link href="/signup" onClick={() => setOpen(false)}>
                                        <Upload className="h-3.5 w-3.5" />
                                        Start uploading
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 px-1">
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                    <Link href="/profile" onClick={() => setOpen(false)}>
                                        <UserRound className="h-3.5 w-3.5" />
                                        Profile
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
                                    <LogOut className="h-3.5 w-3.5" />
                                    Sign out
                                </Button>
                                <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive" onClick={() => setAccountDeleteOpen(true)}>
                                    <Trash2 className="h-3.5 w-3.5" />
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
