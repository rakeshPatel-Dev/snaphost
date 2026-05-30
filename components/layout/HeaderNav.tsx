"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { getHeaderNavItems } from './header-nav-items';

const features = [
    { title: 'Anonymous upload', description: 'Drop a file and get a share link instantly without creating an account.', icon: Upload, href: '/upload' },
    { title: 'Profile dashboard', description: 'Signed-in users can rename files, change slugs, and manage expiration.', icon: Camera, href: '/profile' },
];

export default function HeaderNav() {
    const [showFeatures, setShowFeatures] = useState(false);
    const { isSignedIn } = useAuth();
    const navItems = getHeaderNavItems(isSignedIn);

    return (
        <div className="hidden md:flex flex-1 items-center justify-center">
            <ul className="flex items-center gap-1">
                <li className="relative">
                    <button
                        onClick={() => setShowFeatures(!showFeatures)}
                        onBlur={() => setTimeout(() => setShowFeatures(false), 200)}
                        className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        Product
                        <svg className={`h-3 w-3 transition-transform ${showFeatures ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showFeatures && (
                        <div className="absolute left-0 top-full mt-1 w-105 rounded-md border border-border bg-background shadow-lg">
                            <ul className="p-3 space-y-1">
                                {features.map((feature) => (
                                    <li key={feature.title}>
                                        <Link href={feature.href} className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-accent">
                                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                                                <feature.icon className="h-3.5 w-3.5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="text-[13px] font-medium text-foreground">{feature.title}</div>
                                                <p className="text-[12px] text-muted-foreground">{feature.description}</p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </li>

                {navItems.map((item) => (
                    <li key={item.name}>
                        <Link href={item.href} className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
