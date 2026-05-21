'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-foreground hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">📸</span>
          <span>SnapHost</span>
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Upload
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>
  );
}
