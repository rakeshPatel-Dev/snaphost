"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Link2, Copy, Check, RefreshCcw } from "lucide-react";
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
} from "@/services/anonymous-links";
import { floatingFeatures } from "@/data/floatingFeatures";
import { getApiErrorMessage } from "@/lib/api-error";
import { ANON_ERRORS, TOAST_LABELS } from "@/lib/messages";

type TabType = "upload" | "links";
type UploadState = "idle" | "uploading" | "completed";

interface UploadMockProps {
  showFloatingFeatures?: boolean;
  showInlineFeatures?: boolean;
  className?: string;
}

export function UploadMock({
  showFloatingFeatures = false,
  showInlineFeatures = true,
  className = "",
}: UploadMockProps = {}) {
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
        if (!current) return activeLinks[0] ?? null;
        return activeLinks.some((item) => item.id === current.id)
          ? current
          : activeLinks[0] ?? null;
      });
      setError(null);
      return activeLinks;
    } catch (err) {
      const message = getApiErrorMessage(err, "Could not load links");

      if (message.toLowerCase().includes("session")) {
        setLinks([]);
        setCurrentFile(null);
        setError(null);
        return [] as AnonymousLink[];
      }

      setError(message);
      return [] as AnonymousLink[];
    }
  }, []);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (alive) await refreshLinks();
    };

    void run();
    const intervalId = window.setInterval(() => void refreshLinks(), getAutoCleanupIntervalMs());

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
      toast.success(TOAST_LABELS.anonUpload.success);
      void refreshLinks();
      return newLink;
    } catch (err) {
      const message = getApiErrorMessage(err, ANON_ERRORS.uploadFailed);
      setError(message);
      setUploadState("idle");
      toast.error(message);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) void uploadAnonFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void uploadAnonFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const resetUpload = () => {
    setUploadState("idle");
    setCurrentFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyLink = async (url: string, id: string) => {
    const op = navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });

    await toast.promise(op, {
      loading: TOAST_LABELS.copyLink.loading,
      success: TOAST_LABELS.copyLink.success,
      error: ANON_ERRORS.failedToCopyLink,
    });
  };

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const removeLink = async (id: string) => {
    const op = deleteAnonymousLink(id).then(async () => {
      await refreshLinks();
      if (currentFile?.id === id) {
        setCurrentFile(null);
        setUploadState("idle");
      }
      return true;
    });

    await toast.promise(op, {
      loading: TOAST_LABELS.deleteAnonLink.loading,
      success: TOAST_LABELS.deleteAnonLink.success,
      error: (err) => getApiErrorMessage(err, ANON_ERRORS.failedToDeleteLink),
    });
  };

  const latestLink = links[0] ?? currentFile;

  return (
    <div className={`relative w-full ${className}`}>
      {showFloatingFeatures &&
        floatingFeatures.map(({ className: featClassName, icon: Icon, title, description, tone, iconTone }) => (
          <div key={title} className={`pointer-events-none hidden md:block ${featClassName}`}>
            <div className={`w-52 rounded-4xl border border-border/60 p-3.5 shadow-xl backdrop-blur-xl ${tone}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconTone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium leading-none tracking-tight">{title}</p>
                  <p className="text-xs leading-snug text-current/80">{description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

      <div className="absolute -inset-6 -z-10 rounded-4xl bg-linear-to-br from-muted/10 via-transparent to-transparent blur-2xl opacity-60" />

      <div className="rounded-4xl border border-border/60 bg-card/80 p-4 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:p-6 md:p-7">
        <UploadMockTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          linksCount={links.length}
        />

        {error && (
          <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        {activeTab === "upload" && (
          <div className="space-y-4">
            {uploadState === "idle" && (
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

            {uploadState === "uploading" && (
              <div className="flex flex-col items-center justify-center gap-3 rounded-4xl border border-border/60 bg-muted/20 px-6 py-12 text-center">
                <Loader2 className="h-7 w-7 animate-spin text-accent" />
                <div>
                  <p className="text-sm font-medium tracking-tight text-foreground">Preparing your link…</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Uploading and generating a public URL</p>
                </div>
              </div>
            )}

            {uploadState === "completed" && currentFile && (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 rounded-4xl border border-border/60 bg-background/60 px-3 py-3 sm:px-4 sm:py-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold tracking-wide text-accent">
                    {currentFile.fileType === "pdf" ? "PDF" : "IMG"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate text-xs font-semibold tracking-tight text-foreground">
                        {currentFile.filename}
                      </p>
                      <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-emerald-500">
                        Ready
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {currentFile.fileSize} · expires in 24h
                    </p>
                  </div>
                  <Button
                    onClick={resetUpload}
                    size="icon"
                    className="shrink-0"
                    title="Upload another file"
                  >
                    <RefreshCcw className="h-4.5 w-4.5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-2 sm:py-2.5">
                  <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate font-mono text-xs font-medium text-foreground">
                    {currentFile.url}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0 gap-1.5 rounded-full"
                    onClick={() => copyLink(currentFile.url, currentFile.id)}
                  >
                    {copiedId === currentFile.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedId === currentFile.id ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "links" && (
          <div className="space-y-4">
            {links.length === 0 ? (
              <div className="rounded-4xl border border-dashed border-border/60 bg-muted/20 px-6 py-10 text-center">
                <Link2 className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium tracking-tight text-foreground">No links yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Upload a file to get started.</p>
              </div>
            ) : (
              <>
                {latestLink && (
                  <AnonymousLinkCard
                    {...latestLink}
                    copied={copiedId === latestLink.id}
                    onCopy={copyLink}
                    onOpen={openLink}
                    onDelete={(id) => void removeLink(id)}
                  />
                )}

                {links.length > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-4xl border border-border/60 bg-muted/20 px-4 pl-6 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium tracking-tight text-foreground">
                        {links.length - 1} more link{links.length - 1 === 1 ? "" : "s"}
                      </p>
                      <p className="text-xs text-muted-foreground">Browse, copy, or delete your history.</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      className="shrink-0 gap-1.5 rounded-full"
                      onClick={() => setIsViewAllOpen(true)}
                    >
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
                  onDelete={(id) => void removeLink(id)}
                />
              </>
            )}
          </div>
        )}

        {showInlineFeatures && (
          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-border/40 pt-5 sm:grid-cols-3">
            {floatingFeatures.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-full border border-border/40 bg-muted/20 px-4 py-2.5 text-left transition-colors hover:bg-muted/30"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium leading-tight tracking-tight text-foreground">{title}</p>
                  <p className="truncate text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}