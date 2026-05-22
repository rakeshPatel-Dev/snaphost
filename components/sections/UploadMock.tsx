"use client";

import { useState } from "react";
import { 
  Check, 
  Copy, 
  FileUp, 
  Link2, 
  Code2, 
  Network, 
  UploadCloud, 
  Terminal, 
  ArrowRight,
  Loader2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";

type TabType = 'sandbox' | 'api' | 'cdn';

export function UploadMock() {
  const [activeTab, setActiveTab] = useState<TabType>('sandbox');
  const [copied, setCopied] = useState(false);
  const [apiLang, setApiLang] = useState<'curl' | 'js' | 'python'>('curl');
  const [copiedApi, setCopiedApi] = useState(false);

  // Sandbox simulated upload state
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'completed'>('idle');
  const [selectedFile, setSelectedFile] = useState<{ name: string, size: string, saved: string } | null>(null);

  const url = "snaphost.cloud/f/sh_7y2b1x";

  const copyLink = () => {
    navigator.clipboard?.writeText(`https://${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const simulateUpload = () => {
    if (uploadState !== 'idle') return;
    setUploadState('uploading');
    
    // Simulate steps
    setTimeout(() => {
      setSelectedFile({
        name: "product-hero-2026.png",
        size: "4.2 MB",
        saved: "410 KB (90.2% optimized)"
      });
      setUploadState('completed');
    }, 1500);
  };

  const resetSandbox = () => {
    setUploadState('idle');
    setSelectedFile(null);
  };

  const apiSnippets = {
    curl: `curl -X POST https://api.snaphost.cloud/v1/upload \\
  -H "Authorization: Bearer sh_live_your_key" \\
  -F "file=@/path/to/image.png" \\
  -F "optimize=true"`,
    js: `import { SnapHost } from '@snaphost/sdk';

const sh = new SnapHost('sh_live_your_key');
const result = await sh.upload(file, { optimize: true });

console.log(result.url);`,
    python: `import snaphost

sh = snaphost.Client(api_key="sh_live_your_key")
result = sh.upload("path/to/image.png", optimize=True)

print(result["url"])`
  };

  const copyApiCode = () => {
    navigator.clipboard.writeText(apiSnippets[apiLang]);
    setCopiedApi(true);
    setTimeout(() => setCopiedApi(false), 1500);
  };

  return (
    <div className="relative w-full">
      {/* Background radial soft light */}
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-2xl opacity-60" />
      
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.15)] backdrop-blur-xl">
        {/* Tab Controls */}
        <div className="flex border-b border-border/60 pb-3 mb-5 gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeTab === 'sandbox' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload Sandbox
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeTab === 'api' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Code2 className="h-3.5 w-3.5" />
            Developer API
          </button>
          <button
            onClick={() => setActiveTab('cdn')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeTab === 'cdn' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Network className="h-3.5 w-3.5" />
            CDN Performance
          </button>
        </div>

        {/* 1. Sandbox Tab */}
        {activeTab === 'sandbox' && (
          <div className="space-y-4">
            {uploadState === 'idle' && (
              <div 
                onClick={simulateUpload}
                className="group rounded-xl border border-dashed border-border bg-muted/20 hover:bg-muted/40 px-6 py-10 text-center cursor-pointer transition-all duration-200"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border group-hover:border-primary/40 group-hover:scale-105 transition-all text-muted-foreground group-hover:text-primary">
                  <FileUp className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-foreground">Click to upload mock image</p>
                <p className="mt-1 text-xs text-muted-foreground">Or drag files to simulate compression</p>
                <span className="mt-3.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-full">
                  Try it now <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            )}

            {uploadState === 'uploading' && (
              <div className="rounded-xl border border-border bg-muted/20 px-6 py-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Optimizing and Uploading...</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Converting format, creating WebP variant, compressing media</p>
                </div>
              </div>
            )}

            {uploadState === 'completed' && selectedFile && (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                {/* Uploaded File Block */}
                <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 font-bold text-[11px] text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    WebP
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="truncate text-xs font-bold text-foreground">{selectedFile.name}</p>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 uppercase">90% saved</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Original: {selectedFile.size} • Optimized: {selectedFile.saved}
                    </p>
                  </div>
                  <button 
                    onClick={resetSandbox}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                    title="Reset simulation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Generated Link Card */}
                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-3">
                  <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate font-mono text-xs text-foreground font-medium">{url}</span>
                  <button
                    onClick={copyLink}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-all cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy Link"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. API Tab */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                Integration Code
              </span>
              <div className="flex gap-1">
                {(['curl', 'js', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setApiLang(lang)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${apiLang === lang ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {lang === 'js' ? 'NodeJS' : lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative rounded-xl border border-border bg-slate-950 p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[170px] min-h-[170px]">
              <button 
                onClick={copyApiCode}
                className="absolute right-3 top-3 p-1.5 rounded-md border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-colors text-slate-400 hover:text-white"
              >
                {copiedApi ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <pre className="text-[11px] leading-relaxed pr-10">{apiSnippets[apiLang]}</pre>
            </div>
          </div>
        )}

        {/* 3. CDN Tab */}
        {activeTab === 'cdn' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              SnapHost operates a global Anycast network caching your media files directly in the user's region.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { city: 'New York (US-East)', time: '12ms', type: 'Anycast Edge' },
                { city: 'London (EU-West)', time: '14ms', type: 'Anycast Edge' },
                { city: 'Tokyo (AP-East)', time: '26ms', type: 'Anycast Edge' },
                { city: 'Mumbai (AP-South)', time: '34ms', type: 'Anycast Edge' },
              ].map((item, idx) => (
                <div key={idx} className="rounded-xl border border-border/80 bg-background p-3 flex items-center justify-between gap-2 shadow-sm">
                  <div>
                    <h5 className="text-[11px] font-bold text-foreground">{item.city}</h5>
                    <span className="text-[9px] text-muted-foreground">{item.type}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-mono font-extrabold text-emerald-500 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {item.time}
                    </span>
                    <span className="text-[9px] text-muted-foreground">Ping</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground text-center">
              ⚡ Cache purging occurs globally in less than 300ms.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
