'use client';

import { useState, useEffect } from 'react';

export default function FloatingBadge() {
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(typeof window !== 'undefined' ? window.location.origin : '');
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 duration-300">
      <a
        href={baseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg transition-all hover:bg-background/95 hover:border-border hover:shadow-xl hover:scale-105 active:scale-95"
      >
        <span className="relative flex items-center justify-center h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative  inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span>Uploaded to Snaphost</span>
      </a>
    </div>
  );
}