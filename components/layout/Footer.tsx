'use client';

import { copyrightText, footerLinks, companyLinks } from "@/data/footer";
import Link from "next/link";
import { Heart, ArrowUpRight, } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Logo from "./Logo";
import FeaturePills from "./FeaturePills";
import SocialButtons from "./SocialButtons";
import FeedbackDialog from "../shared/FeedbackDialog";


export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-12">

          {/* Brand col */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <Logo />

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Upload images or PDFs in seconds, then share them with clean direct links. Anonymous uploads work instantly, and signed-in users can manage everything from the dashboard.
            </p>

            {/* Feature pills */}
            <FeaturePills />

            {/* Socials */}
            <SocialButtons />
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1" />

          {/* Links cols */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Product
            </p>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: "Upload", href: "/upload" },
                { label: "Sign up", href: "/sign-up" },
                { label: "Sign in", href: "/sign-in" },
                { label: "Profile", href: "/profile" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 flex flex-col gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Support
            </p>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0 transition-all group-hover:opacity-100 group-hover:-translate-y-1 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <FeedbackDialog />
            </div>
          </div>
        </div>

        <Separator className="opacity-60" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-xs text-muted-foreground">{copyrightText}</p>
          <ul className="flex gap-2.5">
            {companyLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="group flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.name}
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0 transition-all group-hover:opacity-100 group-hover:-translate-y-1 group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>

          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Made with <Heart className="h-3 w-3 fill-primary text-primary" /> by <a href="https://rakeshpatel.me" target="_blank" rel="noopener noreferrer" className="underline">Rakesh Patel</a>
          </p>
        </div>

      </div>
    </footer>
  );
}