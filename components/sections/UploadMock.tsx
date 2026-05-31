"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, FilePlus, Link2, Copy, Check } from "lucide-react";
import UploadMockTabs from "./upload-mock/UploadMockTabs";
import UploadDropzone from "./upload-mock/UploadDropzone";
import AnonymousLinksDialog from "./upload-mock/AnonymousLinksDialog";
import AnonymousLinkCard from "./upload-mock/AnonymousLinkCard";
import type { AnonymousLink } from "@/types/app";
import {
  deleteAnonymousLink,
  fetchAnonymousLinks,
  getAutoCleanupIntervalMs,
  uploadAnonymousFile,
} from "@/services/upload-mock";
import { floatingFeatures } from "@/data/floatingFeatures"

type TabType = "upload" | "links";
type UploadState = "idle" | "uploading" | "completed";



export function UploadMock() {
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [links, setLinks] = useState<AnonymousLink[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [currentFile, setCurrentFile] = useState<AnonymousLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refreshLinks = useCallback(async () => {
    try {
      const activeLinks = await fetchAnonymousLinks();
      setLinks(activeLinks);
      setCurrentFile((current) => {
        if (!current) {
          return activeLinks[0] ?? null;
        }

        return activeLinks.some((item) => item.id === current.id) ? current : activeLinks[0] ?? null;
      });
      setError(null);
      return activeLinks;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to refresh anonymous links";

      if (message.toLowerCase().includes('session')) {
        setLinks([]);
        setCurrentFile(null);
        setError(null);
        return [] as AnonymousLink[];
      }

      console.error('refresh anon links', err);
      setError(message);
      return [] as AnonymousLink[];
    }
  }, []);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!alive) {
        return;
      }

      await refreshLinks();
    };

    void run();

    const intervalId = window.setInterval(() => {
      void refreshLinks();
    }, getAutoCleanupIntervalMs());

    return () => {
      alive = false;
      window.clearInterval(intervalId);
    };
  }, [refreshLinks]);

  const uploadAnonFile = async (file: File) => {
    setError(null);
    setUploadState("uploading");

    try {
      const newLink = await uploadAnonymousFile(file);
      setLinks((current) => [newLink, ...current.filter((item) => item.id !== newLink.id)]);
      setCurrentFile(newLink);
      setUploadState("completed");

      toast.success('Anonymous link created');
      void refreshLinks();

      return newLink;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      setUploadState('idle');
      toast.error(message);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      void uploadAnonFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      void uploadAnonFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const resetUpload = () => {
    setUploadState("idle");
    setCurrentFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyLink = async (url: string, id: string) => {
    const op = navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });

    await toast.promise(op, {
      loading: 'Copying...',
      success: 'Link copied to clipboard',
      error: 'Failed to copy link',
    });
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const removeLink = async (id: string) => {
    const op = deleteAnonymousLink(id).then(async () => {
      await refreshLinks();

      if (currentFile?.id === id) {
        setCurrentFile(null);
        setUploadState('idle');
      }

      return true;
    });

    await toast.promise(op, {
      loading: 'Deleting anonymous link...',
      success: 'Anonymous link removed',
      error: (err) => (err instanceof Error ? err.message : 'Failed to delete link'),
    });
  };

  const latestLink = links[0] ?? currentFile;

  return (
    <div className="relative w-full">
      {floatingFeatures.map(({ className, icon: Icon, title, description, tone, iconTone }) => (
        <div key={title} className={`pointer-events-none ${className}`}>
          <div className={`w-48 rounded-2xl border p-3 shadow-xl backdrop-blur-md ${tone}`}>
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconTone}`}>
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-semibold leading-none">{title}</p>
                <p className="text-[11px] leading-snug text-current/90">{description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute -inset-6 -z-10 rounded-3xl bg-linear-to-br from-muted/10 via-transparent to-transparent blur-2xl opacity-60" />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.15)] backdrop-blur-xl">
        <UploadMockTabs activeTab={activeTab} onTabChange={setActiveTab} linksCount={links.length} />

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-4">
            {uploadState === 'idle' && (
              <UploadDropzone
                isDragging={isDragging}
                fileInputRef={fileInputRef}
                onFileSelect={handleFileSelect}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              />
            )}

            {uploadState === 'uploading' && (
              <div className="rounded-xl border border-border bg-muted/20 px-6 py-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-accent animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Uploading and preparing anonymous link...</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Validating, storing, and generating the public URL</p>
                </div>
              </div>
            )}

            {uploadState === 'completed' && currentFile && (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 font-bold text-[11px] text-accent border border-accent/20">
                    {currentFile.fileType === 'pdf' ? 'PDF' : 'IMG'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="truncate text-xs w-55 font-bold text-foreground">{currentFile.filename}</p>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 uppercase">ready to share</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Original: {currentFile.fileSize} • Auto-delete in 24 hours
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetUpload}
                    className="p-1 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/5 transition-all hover:scale-105"
                    title="Upload another file"
                  >
                    <FilePlus className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-3">
                  <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate font-mono text-xs text-foreground font-medium">{currentFile.url}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    onClick={() => copyLink(currentFile.url, currentFile.id)}
                  >
                    {copiedId === currentFile.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedId === currentFile.id ? 'Copied' : 'Copy link'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-4">

            {links.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
                <Link2 className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold text-foreground">No anonymous links yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Upload a file to see it appear here.</p>
              </div>
            ) : (
              <>
                {latestLink && (
                  <AnonymousLinkCard
                    {...latestLink}
                    copied={copiedId === latestLink.id}
                    onCopy={copyLink}
                    onOpen={openLink}
                    onDelete={(id) => {
                      void removeLink(id);
                    }}
                  />
                )}

                {links.length > 1 && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{links.length - 1} more anonymous link{links.length - 1 === 1 ? '' : 's'}</p>
                      <p className="text-xs text-muted-foreground">Browse, copy, or delete the full browser history.</p>
                    </div>
                    <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => setIsViewAllOpen(true)}>
                      View all
                    </Button>
                  </div>
                )}

                <AnonymousLinksDialog
                  open={isViewAllOpen}
                  onOpenChange={setIsViewAllOpen}
                  links={links}
                  copiedId={copiedId}
                  onCopy={copyLink}
                  onOpen={openLink}
                  onDelete={(id) => {
                    void removeLink(id);
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
