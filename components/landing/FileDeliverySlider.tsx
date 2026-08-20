'use client';

import { SeparatorVertical } from 'lucide-react';
import React, { useState, useRef } from 'react';

export default function FileDeliverySlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isSliding, setIsSliding] = useState(false);

  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) handleSliderMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1 || isSliding) handleSliderMove(e.clientX);
  };

  return (
    <div
      ref={sliderRef}
      className="relative h-64 w-full rounded-xl overflow-hidden cursor-ew-resize select-none border border-border"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseDown={(e) => {
        setIsSliding(true);
        e.preventDefault();
      }}
      onMouseUp={() => setIsSliding(false)}
      onMouseLeave={() => setIsSliding(false)}
    >
      {/* ── LEFT PANEL: Before (Local / unshared file) ── */}
      <div
        className="absolute inset-0 bg-zinc-950 flex flex-col justify-between p-5 transition-none"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        {/* Subtle grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none" />

        {/* Top row */}
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Before upload</span>
            <h4 className="text-sm font-bold text-zinc-300 mt-0.5 truncate max-w-40">hero-banner-v3.png</h4>
          </div>
          <span className="shrink-0 text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/80 px-2 py-0.5 rounded-full">
            LOCAL
          </span>
        </div>

        {/* Middle mock file info */}
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
            Sitting on your hard drive
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
            No share link exists yet
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
            Needs email / Drive to share
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="relative z-10 flex flex-col gap-1.5">
          <div className="flex gap-4 text-xs text-zinc-500">
            <div><span className="text-zinc-600">Size:</span> 8.4 MB</div>
            <div><span className="text-zinc-600">Format:</span> PNG</div>
            <div><span className="text-zinc-600">Status:</span> Not shared</div>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/60">
            <div className="h-full bg-zinc-700 w-1/4 rounded-full" />
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: After (Hosted / ready to share) ── */}
      <div
        className="absolute inset-0 bg-zinc-950 flex flex-col justify-between p-5 transition-none"
        style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
      >
        {/* Emerald tinted grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.025)_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none" />

        {/* Top row */}
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-semibold text-emerald-500/70 uppercase tracking-widest">After upload</span>
            <h4 className="text-sm font-bold text-white mt-0.5 truncate max-w-45">snaphost.cloud/jane/hero-banner-v3.png</h4>
          </div>
          <span className="shrink-0 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Middle mock delivery info */}
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Hosted on Supabase Storage
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Direct public share link active
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Original format preserved — PNG
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="relative z-10 flex flex-col gap-1.5">
          <div className="flex gap-4 text-xs text-zinc-400">
            <div><span className="text-emerald-500/60 font-medium">Link:</span> /jane/filename</div>
            <div><span className="text-emerald-500/60 font-medium">Type:</span> Public</div>
            <div><span className="text-emerald-500/60 font-medium">TTL:</span> User-set</div>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-emerald-500/15">
            <div className="h-full bg-emerald-500 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* ── DIVIDER HANDLE ── */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/60 cursor-ew-resize flex items-center justify-center pointer-events-none"
        style={{ left: `calc(${sliderPosition}% - 1px)` }}
      >
        <div className="h-8 w-8 rounded-full bg-white shadow-xl flex items-center justify-center text-zinc-700 pointer-events-none">
          {/* <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7H1M4 7L2.5 5M4 7L2.5 9M10 7H13M10 7L11.5 5M10 7L11.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg> */}

          <SeparatorVertical size={14} className="text-zinc-700" />
        </div>
      </div>
    </div>
  );
}
