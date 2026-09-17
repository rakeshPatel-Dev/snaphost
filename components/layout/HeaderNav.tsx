"use client";

import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

export default function HeaderNav() {
    const { isSignedIn } = useAuth();

    const navItems = [
        { name: 'Features', href: '/#features' },
        { name: 'Pricing', href: '/#pricing' },
        { name: 'FAQ', href: '/#faq' },
        { name: 'Company', href: '/company' },
        ...(isSignedIn ? [{ name: 'Dashboard', href: '/profile' }] : []),
    ];

    return (
        <nav className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
                >
                    {item.name}
                </Link>
            ))}
        </nav>
    );
}
