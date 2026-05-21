'use client';

import { copyrightText, footerLinks } from "@/data/footer";
import Link from "next/link";

export default function Footer() {

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              SnapHost
            </h3>
            <p className="text-sm text-muted-foreground">
              Makes it simple to upload and share files instantly. No sign up required.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Features
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-foreground">✓</span> Instant upload
              </li>
              <li className="flex items-center gap-2">
                <span className="text-foreground">✓</span> No sign up needed
              </li>
              <li className="flex items-center gap-2">
                <span className="text-foreground">✓</span> Secure links
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
             {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}