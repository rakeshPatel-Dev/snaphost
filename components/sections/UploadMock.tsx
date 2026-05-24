"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Archive, FilePlus, Link2, Clock, Copy, Check, ExternalLink, Trash2 } from "lucide-react";
import UploadMockTabs from "./upload-mock/UploadMockTabs";
import UploadDropzone from "./upload-mock/UploadDropzone";
import AnonymousLinksDialog from "./upload-mock/AnonymousLinksDialog";
import type { AnonymousLink } from "@/types/app";
import {
  deleteAnonymousLink,
  formatShortDate,
  getAutoCleanupIntervalMs,
  getTimeRemaining,
  hydrateAnonymousLinks,
  uploadAnonymousFile,
} from "@/services/upload-mock";

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
  const linksRef = useRef<AnonymousLink[]>([]);

  useEffect(() => {
    linksRef.current = links;
  }, [links]);

  useEffect(() => {
    let alive = true;

    const refreshLinks = async () => {
      const activeLinks = await hydrateAnonymousLinks(linksRef.current);

      if (!alive) {
        return;
      }

      setLinks(activeLinks);
      setCurrentFile((current) => {
        if (!current) {
          return current;
        }

        return activeLinks.some((item) => item.id === current.id) ? current : null;
      });
    };

    void refreshLinks();

    const intervalId = window.setInterval(() => {
      void refreshLinks();
    }, getAutoCleanupIntervalMs());

    return () => {
      alive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const uploadAnonFile = async (file: File) => {
    setError(null);
    setUploadState("uploading");

    try {
      const op = uploadAnonymousFile(file).then((newLink) => {
        setLinks((current) => [newLink, ...current]);
        setCurrentFile(newLink);
        setUploadState("completed");
        return newLink;
      });

      await toast.promise(op, {
        loading: 'Uploading anonymous file...',
        success: 'Anonymous link created',
        error: (err) => (err instanceof Error ? err.message : 'Upload failed'),
      });
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
    const op = deleteAnonymousLink(id).then(() => {
      setLinks((current) => current.filter((item) => item.id !== id));

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
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-linear-to-br from-muted/10 via-transparent to-transparent blur-2xl opacity-60" />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.15)] backdrop-blur-xl">
        <UploadMockTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
                      <p className="truncate text-xs font-bold text-foreground">{currentFile.filename}</p>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 uppercase">ready to share</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Original: {currentFile.fileSize} • Auto-delete in 24 hours
                    </p>
                  </div>
                  <button
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
            <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2">
              <div>
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Archive className="h-3.5 w-3.5 text-accent" />
                  Anonymous links synced from the database
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  This demo reads expiration from the database and removes expired links automatically.
                </p>
              </div>
              <span className="rounded-full bg-muted/10 px-2.5 py-1 text-[11px] font-semibold text-foreground tabular-nums">
                {links.length}
              </span>
            </div>

            {links.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
                <Link2 className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold text-foreground">No anonymous links yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Upload a file to see it appear here.</p>
              </div>
            ) : (
              <>
                {latestLink && (
                  <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/20 border border-border">
                            <span className="text-[10px] font-bold text-foreground">{latestLink.fileType === 'pdf' ? 'PDF' : 'IMG'}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{latestLink.filename}</p>
                            <p className="text-[11px] text-muted-foreground">Created {formatShortDate(latestLink.createdAt)} • {latestLink.fileSize}</p>
                          </div>
                        </div>

                        <div className="mt-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                          <p className="truncate font-mono text-[11px] text-foreground">{latestLink.url}</p>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{getTimeRemaining(latestLink.expiresAt)}</span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span>Synced from DB</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2">
                        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => copyLink(latestLink.url, latestLink.id)}>
                          {copiedId === latestLink.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedId === latestLink.id ? 'Copied' : 'Copy'}
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => openLink(latestLink.url)}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => void removeLink(latestLink.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {links.length > 1 && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{links.length - 1} more anonymous link{links.length - 1 === 1 ? '' : 's'}</p>
                      <p className="text-xs text-muted-foreground">Browse, copy, or delete the full browser history.</p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setIsViewAllOpen(true)}>
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
