"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BsGithub } from 'react-icons/bs';
import { Upload } from 'lucide-react';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';
import { useAuth } from '@/components/providers/auth-provider';
import UserMenu from './UserMenu';

export default function HeaderActions() {
    const { isSignedIn } = useAuth();

    return (
        <div className="hidden md:flex items-center gap-2">
            <AnimatedThemeToggler />
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
                <UserMenu />
            )}
        </div>
    );
}
