"use client";

import Logo from './Logo';
import HeaderNav from './HeaderNav';
import HeaderActions from './HeaderActions';
import HeaderMobile from './HeaderMobile';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-4 sm:px-6">
                <Logo />
                <HeaderNav />
                <HeaderActions />
                <HeaderMobile />
            </div>
        </header>
    );
}
