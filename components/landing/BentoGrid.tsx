'use client';

import React, { useState, useRef } from 'react';
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
  Copy
} from 'lucide-react';

export default function BentoGrid() {
  // Before/After Slider State
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isSliding, setIsSliding] = useState(false);

  // Security Widget States
  const [isLocked, setIsLocked] = useState(true);
  const [expiry, setExpiry] = useState('24h');

  // Copy API state
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1 || isSliding) {
      handleSliderMove(e.clientX);
    }
  };

  const codeSnippet = `import { SnapHost } from '@snaphost/sdk';

const client = new SnapHost({ apiKey: 'sh_live_...' });
const file = await client.upload(myFile, {
  optimize: true,
  format: 'webp',
  expiry: '24h'
});

console.log(file.url); // => snaphost.cloud/f/abc123`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 -z-10" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-accent/5 blur-3xl -z-10" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl -z-10" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Everything you need to deliver media at scale
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            A developer-first API, automatic WebP optimization, edge-caching CDN, and granular sharing settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Before/After Image Slider (Wider) */}
          <div className="md:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between overflow-hidden group">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Cpu className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Automatic WebP Compression</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Images are automatically converted to optimized formats (WebP/AVIF) and compressed at upload. Drag the slider to compare quality and size.
              </p>
            </div>

            {/* Draggable Slider Container */}
            <div 
              ref={sliderRef}
              className="relative h-64 w-full rounded-xl overflow-hidden cursor-ew-resize select-none border border-border"
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onMouseDown={() => setIsSliding(true)}
              onMouseUp={() => setIsSliding(false)}
              onMouseLeave={() => setIsSliding(false)}
            >
              {/* Original Image Container (Left Side / Underneath) */}
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                {/* Visual placeholder representation of original image (vibrant abstract layout) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/80 via-accent/80 to-accent/80 opacity-70 blur-[1px]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/90 p-4">
                  <span className="text-xl font-bold tracking-wider">ORIGINAL JPEG</span>
                  <span className="text-sm bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full mt-1 border border-white/10">4.8 MB</span>
                </div>
              </div>

              {/* Optimized Image Container (Right Side / Clipped Overlay) */}
              <div 
                className="absolute inset-0 bg-slate-950 flex items-center justify-center transition-all duration-75"
                style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
              >
                {/* Visual placeholder representation of optimized WebP image (stunning crisp abstract layout) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 via-accent to-accent opacity-90" />
                {/* Subtle grid pattern overlay only on the optimized side to show sharpness */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:16px_16px]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                  <span className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">OPTIMIZED WebP</span>
                  <span className="text-sm bg-emerald-500/20 text-emerald-300 backdrop-blur-md px-2.5 py-0.5 rounded-full mt-1 border border-emerald-500/30 font-semibold">
                    450 KB (91% Saved)
                  </span>
                </div>
              </div>

              {/* Draggable Divider Line */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="h-8 w-8 rounded-full bg-white shadow-lg border border-border flex items-center justify-center text-slate-800 pointer-events-none hover:scale-105 transition-transform">
                  <span className="text-xs font-bold font-mono">↔</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Global Edge CDN Network */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                  <Globe className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Global Edge CDN</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Media is cached and distributed at edge servers globally, delivering sub-20ms loading speeds.
              </p>
            </div>

            {/* CDN Speed Metric Widget */}
            <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border/40 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Edge: New York
                </span>
                <span className="font-semibold text-emerald-500">12ms</span>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[90%]" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Edge: London
                </span>
                <span className="font-semibold text-emerald-500">14ms</span>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[85%]" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Edge: Tokyo
                </span>
                <span className="font-semibold text-emerald-500">26ms</span>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[70%]" />
              </div>
              <div className="border-t border-border/40 pt-2 flex justify-between items-center font-sans text-xs mt-1">
                <span className="text-muted-foreground">Global Cache Hit Rate</span>
                <span className="font-extrabold text-foreground">99.4%</span>
              </div>
            </div>
          </div>

          {/* 3. Developer SDK & API (Wide) */}
          <div className="md:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between overflow-hidden group">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                  <Code className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">SDK & REST API</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Integrate in minutes with our clean SDK and simple HTTPS endpoints. Perfect for user uploads, profile avatars, or document processing.
              </p>
            </div>

            {/* SDK Code Block */}
            <div className="relative rounded-xl border border-border/40 bg-slate-950 p-4 text-xs font-mono text-slate-300 overflow-x-auto">
              <button 
                onClick={copyCode} 
                className="absolute right-3 top-3 p-1.5 rounded-md border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-colors text-slate-400 hover:text-white"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <pre className="pr-10">{codeSnippet}</pre>
            </div>
          </div>

          {/* 4. Smart Sharing / Expirations */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <Shield className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Smart Expirations</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Protect sensitive files. Set password requirements and configure files to auto-delete after view.
              </p>
            </div>

            {/* Interactive Security Widget */}
            <div className="bg-muted/40 p-4 rounded-xl border border-border/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  {isLocked ? <Lock className="h-3.5 w-3.5 text-amber-500" /> : <Unlock className="h-3.5 w-3.5 text-muted-foreground" />}
                  Password Protection
                </span>
                <button 
                  onClick={() => setIsLocked(!isLocked)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isLocked ? 'bg-primary' : 'bg-input'}`}
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
                  <option value="1h">1 Hour</option>
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground text-center">
                {isLocked ? '🔒 Access requires password key' : '🔓 Publicly accessible link'}
                {expiry !== 'never' && ` • Deletes automatically in ${expiry}`}
              </div>
            </div>
          </div>

          {/* 5. Metrics & Analytics */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                  <TrendingDown className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Traffic Analytics</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Monitor request volume, bandwidth metrics, and caching effectiveness from a single console.
              </p>
            </div>

            {/* Custom Mini Graph & Stat */}
            <div className="bg-muted/40 p-4 rounded-xl border border-border/40">
              <div className="flex items-end justify-between gap-1 h-16 mb-2">
                {[30, 45, 35, 60, 40, 75, 90, 65, 80, 95].map((val, idx) => (
                  <div key={idx} className="flex-1 bg-gradient-to-t from-accent to-accent/60 rounded-t-[2px] transition-all hover:opacity-80" style={{ height: `${val}%` }} />
                ))}
              </div>
              <div className="flex justify-between items-center text-[11px] font-medium mt-3 border-t border-border/40 pt-2">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[9px] uppercase">Bandwidth Saved</span>
                  <span className="text-foreground font-bold">1.42 TB</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-muted-foreground text-[9px] uppercase">Avg Compression</span>
                  <span className="text-emerald-500 font-bold">89.4%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Instant Drag & Drop Upload (Wider) */}
          <div className="md:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between overflow-hidden group">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-500">
                  <Zap className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Zero Configuration Hosting</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                No complex IAM roles, bucket policies, or CORS configurations. We manage storage, CDN integration, and ssl certificates automatically.
              </p>
            </div>

            {/* Interactive Upload Box Placeholder visual representation */}
            <div className="border border-dashed border-border rounded-xl bg-muted/20 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border border-border shadow-sm">
                  <FileCheck className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Auto SSL & CNAME</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Custom domains load over HTTPS in 1 click.</p>
                </div>
              </div>
              <div className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg">
                Active
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
