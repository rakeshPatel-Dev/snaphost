'use client';

import React, { useState } from 'react';
import {
  Shield,
  Cpu,
  Globe,
  Zap,
  Clock,
  TrendingDown,
  Code,
  FileCheck,
  Lock,
  Unlock,
  Check,
  Copy,
  User,
  UserX,
  ExternalLink,
} from 'lucide-react';
import Container from '@/components/shared/Container';
import SectionHeading from '@/components/shared/SectionHeading';
import FileDeliverySlider from './FileDeliverySlider';

export default function BentoGrid() {
  const [isLocked, setIsLocked] = useState(true);
  const [expiry, setExpiry] = useState('24h');
  const [copiedCode, setCopiedCode] = useState(false);

  const codeSnippet = `// Signed-in user upload
const userLink = 'https://snaphost.cloud/jane/hero-banner.png';

// Anonymous upload
const anonLink = 'https://snaphost.cloud/anon/sh_7y2b1x';

console.log(userLink);   // → direct, clean, permanent
console.log(anonLink);   // → compact, auto-expires`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="features" className="py-20 sm:py-24 relative overflow-hidden scroll-mt-16">
      <Container>
        <SectionHeading
          title="Everything you need for fast file sharing"
          description="Direct share links, original-file uploads, and a dashboard built for clean, fast sharing."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 1. Before/After File Delivery Slider (Wider) */}
          <div className="md:col-span-2 rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] flex flex-col gap-5 overflow-hidden">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Cpu className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Original file delivery</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload PNG, JPG, WEBP, or PDF and we keep your file format intact — no compression, no conversion. Drag the handle to compare.
              </p>
            </div>

            <FileDeliverySlider />
          </div>

          {/* 2. Direct public links */}
          <div className="rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                  <Globe className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Direct public links</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Every upload gets an instant public URL. Signed-in users get a clean username path. Anonymous uploads get a compact hash link.
              </p>
            </div>

            <div className="space-y-3">
              {/* Signed-in URL */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <User className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-bold uppercase tracking-widest text-accent">Signed-in</span>
                </div>
                <div className="font-mono text-xs leading-relaxed break-all">
                  <span className="text-muted-foreground">snaphost.cloud/</span>
                  <span className="text-foreground font-semibold bg-accent/10 px-0.5 rounded">jane</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-foreground font-semibold">hero-banner.png</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-xs font-semibold bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full">Username path</span>
                  <span className="text-xs font-semibold bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full">Original filename</span>
                  <span className="text-xs font-semibold bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full">User-set expiry</span>
                </div>
              </div>

              {/* Anonymous URL */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <UserX className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Anonymous</span>
                </div>
                <div className="font-mono text-xs leading-relaxed break-all">
                  <span className="text-muted-foreground">snaphost.cloud/</span>
                  <span className="text-muted-foreground font-semibold bg-muted/40 px-0.5 rounded">anon</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-foreground font-semibold">sh_7y2b1x</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-xs font-semibold bg-muted/30 text-muted-foreground border border-border/40 px-1.5 py-0.5 rounded-full">No account needed</span>
                  <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">Auto-expires 24h</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground border-t border-border/30">
                <span>Both links are instantly copyable and shareable.</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {/* 3. Link formats code block (Wider) */}
          <div className="md:col-span-2 rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] flex flex-col gap-5 overflow-hidden">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                  <Code className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Link formats</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Signed-in users get direct username URLs. Anonymous uploads stay compact with a short hash. Both are immediately ready to paste anywhere.
              </p>
            </div>

            <div className="relative rounded-xl border border-border/40 bg-zinc-950 p-4 text-xs font-mono text-zinc-300 overflow-x-auto">
              <button
                onClick={copyCode}
                className="absolute right-3 top-3 p-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white cursor-pointer"
                aria-label="Copy code"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <pre className="pr-10 leading-relaxed whitespace-pre-wrap break-all">
                <span className="text-zinc-600">{'// Signed-in user upload\n'}</span>
                <span className="text-zinc-400">{'const userLink = '}</span>
                <span className="text-emerald-400">{'\'https://snaphost.cloud/jane/hero-banner.png\''}</span>
                <span className="text-zinc-400">{';\n\n'}</span>
                <span className="text-zinc-600">{'// Anonymous upload\n'}</span>
                <span className="text-zinc-400">{'const anonLink = '}</span>
                <span className="text-amber-400">{'\'https://snaphost.cloud/anon/sh_7y2b1x\''}</span>
                <span className="text-zinc-400">{';\n\n'}</span>
                <span className="text-zinc-600">{'// userLink → direct, clean, permanent\n'}</span>
                <span className="text-zinc-600">{'// anonLink → compact, auto-expires in 24h'}</span>
              </pre>
            </div>
          </div>

          {/* 4. Expiration controls */}
          <div className="rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <Shield className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Expiration controls</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Anonymous uploads expire after 24 hours. Signed-in users can set custom expiry or keep files live indefinitely.
              </p>
            </div>

            <div className="bg-muted/20 p-4 rounded-xl border border-border/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  {isLocked ? <Lock className="h-3.5 w-3.5 text-amber-500" /> : <Unlock className="h-3.5 w-3.5 text-muted-foreground" />}
                  Anonymous upload mode
                </span>
                <button
                  onClick={() => setIsLocked(!isLocked)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isLocked ? 'bg-accent' : 'bg-input'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${isLocked ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Auto-Delete TTL
                </span>
                <select
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="bg-background text-foreground text-xs font-medium border border-border rounded-md px-2 py-1 outline-none cursor-pointer"
                >
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground text-center">
                {isLocked ? '🔒 Anonymous links expire automatically' : '🔓 Signed-in uploads use direct links'}
                {expiry !== 'never' && ` • Kept live for ${expiry}`}
              </div>
            </div>
          </div>

          {/* 5. File activity */}
          <div className="rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                  <TrendingDown className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">File activity</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Monitor upload volume, file status, and what needs attention from your profile dashboard.
              </p>
            </div>

            <div className="bg-muted/20 p-4 rounded-xl border border-border/40">
              <div className="flex items-end justify-between gap-1 h-16 mb-2">
                {[30, 45, 35, 60, 40, 75, 90, 65, 80, 95].map((val, idx) => (
                  <div key={idx} className="flex-1 bg-linear-to-t from-accent to-accent/60 rounded-t-sm transition-all hover:opacity-80" style={{ height: `${val}%` }} />
                ))}
              </div>
              <div className="flex justify-between items-center text-xs font-medium mt-3 border-t border-border/40 pt-2">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs uppercase">Files this week</span>
                  <span className="text-foreground font-bold">142</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-muted-foreground text-xs uppercase">Anonymous share rate</span>
                  <span className="text-emerald-500 font-bold">68%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Direct upload flow (Wider) */}
          <div className="md:col-span-2 rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] flex flex-col gap-5 overflow-hidden">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-500">
                  <Zap className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Direct upload flow</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Drop a file, get a share URL, and keep moving. Storage, validation, and cleanup run in the background.
              </p>
            </div>

            <div className="border border-dashed border-border rounded-xl bg-muted/20 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border border-border shadow-sm">
                  <FileCheck className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Direct share URL</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Upload once and copy the link instantly.</p>
                </div>
              </div>
              <div className="text-xs font-semibold bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full">
                Active
              </div>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
