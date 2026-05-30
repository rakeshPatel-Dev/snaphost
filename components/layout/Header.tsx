"use client";

import Logo from './Logo';
import HeaderAnnouncement from './HeaderAnnouncement';
import HeaderNav from './HeaderNav';
import HeaderActions from './HeaderActions';
import HeaderMobile from './HeaderMobile';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
            <HeaderAnnouncement />

            <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
                <Logo />
                <HeaderNav />
                <HeaderActions />
                <HeaderMobile />
            </nav>
        </header>
    );
}
