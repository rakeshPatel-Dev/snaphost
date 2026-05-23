"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowRight,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  Trash2,
  UploadCloud,
  Archive,
  FilePlus,
} from "lucide-react";
import AnonUpload from "../icons/AnonUpload";

type TabType = "upload" | "links";

type AnonymousLink = {
  id: string;
  filename: string;
  fileType: "image" | "pdf";
  fileSize: string;
  url: string;
  createdAt: string;
  expiresAt: string;
};

const AUTO_CLEANUP_INTERVAL_MS = 60 * 1000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
]);

function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1) {
    return `${megabytes.toFixed(1)} MB`;
  }

  const kilobytes = bytes / 1024;
  return `${kilobytes.toFixed(0)} KB`;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getTimeRemaining(value: string) {
  const remaining = new Date(value).getTime() - Date.now();

  if (remaining <= 0) {
    return "Expired";
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  if (hours >= 24) {
    return `${Math.ceil(hours / 24)} day${Math.ceil(hours / 24) === 1 ? "" : "s"} left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${Math.max(1, minutes)}m left`;
}

async function hydrateLinksFromDb(storedLinks: AnonymousLink[]) {
  const hydrated = await Promise.all(
    storedLinks.map(async (item) => {
      const response = await fetch(`/api/files/${item.id}`);

      if (!response.ok) {
        return null;
      }

      const metadata = (await response.json()) as {
        expiresAt: string | null;
      };

      if (!metadata.expiresAt || new Date(metadata.expiresAt).getTime() <= Date.now()) {
        return null;
      }

      return {
        ...item,
        expiresAt: metadata.expiresAt,
      };
    })
  );

  return hydrated.filter((item): item is AnonymousLink => Boolean(item));
}

export function UploadMock() {
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [links, setLinks] = useState<AnonymousLink[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "completed">("idle");
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
    const refreshLinks = async () => {
      const activeLinks = await hydrateLinksFromDb(linksRef.current);
      setLinks(activeLinks);
    };

    void refreshLinks();

    const intervalId = window.setInterval(() => {
      void refreshLinks();
    }, AUTO_CLEANUP_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const uploadAnonFile = async (file: File) => {
    if (!ALLOWED_TYPES.has(file.type)) {
      const errorMessage = "Invalid file type. Allowed: PNG, JPG, WEBP, PDF";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const errorMessage = `File too large. Max: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setError(null);
    setUploadState("uploading");

    const op = (async () => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "omit",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message =
          data?.details?.join?.(", ") ||
          data?.details ||
          data?.error ||
          "Upload failed";
        throw new Error(message);
      }

      const data = await response.json();
      const url = data.url || `${window.location.origin}/anon/${data.fileId}`;
      const expiresAt = data.expiresAt || new Date().toISOString();

      const newLink: AnonymousLink = {
        id: data.fileId,
        filename: file.name,
        fileType: file.type === "application/pdf" ? "pdf" : "image",
        fileSize: formatFileSize(file.size),
        url,
        createdAt: new Date().toISOString(),
        expiresAt,
      };

      setLinks((current) => [newLink, ...current]);
      setCurrentFile(newLink);
      setUploadState("completed");

      return newLink;
    })();

    try {
      await toast.promise(op, {
        loading: 'Uploading anonymous file...',
        success: 'Anonymous link created',
        error: (err) => (err instanceof Error ? err.message : 'Upload failed'),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      setUploadState('idle');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      uploadAnonFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      uploadAnonFile(file);
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
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const removeLink = async (id: string) => {
    const op = (async () => {
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Failed to delete link');
      }

      setLinks((current) => current.filter((item) => item.id !== id));

      if (currentFile?.id === id) {
        setCurrentFile(null);
        setUploadState('idle');
      }

      return true;
    })();

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
        <div className="flex border-b border-border/60 pb-3 mb-5 gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeTab === "upload" ? "bg-muted/20 text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Anonymous upload
          </button>
          <button
            onClick={() => setActiveTab("links")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeTab === "links" ? "bg-muted/20 text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <Link2 className="h-3.5 w-3.5" />
            Created links
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {activeTab === "upload" && (
          <div className="space-y-4">
            {uploadState === "idle" && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`group rounded-xl border border-dashed px-6 py-10 text-center cursor-pointer transition-all duration-200 ${isDragging ? "border-accent bg-accent/5" : "border-border bg-muted/20 hover:bg-muted/40"}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  title="Anonymous upload file input"
                  onChange={handleFileSelect}
                  accept="image/png,image/jpeg,image/webp,.pdf,application/pdf"
                  className="hidden"
                />
                <div className="mx-auto mb-3 flex h-18 w-18 items-center justify-center rounded-full bg-background border border-border group-hover:border-accent/40 group-hover:scale-105 transition-all text-muted-foreground group-hover:text-accent">
                  <AnonUpload className="h-15 w-15" />
                </div>
                <p className="text-sm font-semibold text-foreground">Drop a file or click to create an anonymous link</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP, and PDF only. Anonymous links expire automatically in 24 hours.</p>
                <span className="mt-3.5 inline-flex items-center gap-1 text-[11px] font-medium text-foreground bg-muted/10 border border-border/10 px-2 py-0.5 rounded-full">
                  Try it now <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            )}

            {uploadState === "uploading" && (
              <div className="rounded-xl border border-border bg-muted/20 px-6 py-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-accent animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Uploading and preparing anonymous link...</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Validating, storing, and generating the public URL</p>
                </div>
              </div>
            )}

            {uploadState === "completed" && currentFile && (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 font-bold text-[11px] text-accent border border-accent/20">
                    {currentFile.fileType === "pdf" ? "PDF" : "IMG"}
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
                    {copiedId === currentFile.id ? "Copied" : "Copy link"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "links" && (
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
                            <span className="text-[10px] font-bold text-foreground">{latestLink.fileType === "pdf" ? "PDF" : "IMG"}</span>
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
                          {copiedId === latestLink.id ? "Copied" : "Copy"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => openLink(latestLink.url)}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open
                        </Button>
                        <DeleteConfirmDialog
                          trigger={(
                            <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          )}
                          title="Delete this anonymous link?"
                          description="This will remove the file from storage, delete the database record, and remove it from this browser's local history."
                          confirmLabel="Delete link"
                          destructiveClassName="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onConfirm={() => removeLink(latestLink.id)}
                        />
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

                <Dialog open={isViewAllOpen} onOpenChange={setIsViewAllOpen}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>All anonymous links</DialogTitle>
                      <DialogDescription>
                        These links are stored only in this browser and expire automatically after 24 hours.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                      {links.map((item) => {
                        const isCopied = copiedId === item.id;

                        return (
                          <div key={item.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/20 border border-border">
                                    <span className="text-[10px] font-bold text-foreground">{item.fileType === "pdf" ? "PDF" : "IMG"}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-foreground">{item.filename}</p>
                                    <p className="text-[11px] text-muted-foreground">Created {formatShortDate(item.createdAt)} • {item.fileSize}</p>
                                  </div>
                                </div>

                                <div className="mt-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                                  <p className="truncate font-mono text-[11px] text-foreground">{item.url}</p>
                                </div>

                                <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{getTimeRemaining(item.expiresAt)}</span>
                                  <span className="h-1 w-1 rounded-full bg-border" />
                                  <span>Synced from DB</span>
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-col gap-2">
                                <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => copyLink(item.url, item.id)}>
                                  {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                  {isCopied ? "Copied" : "Copy"}
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => openLink(item.url)}>
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Open
                                </Button>
                                <DeleteConfirmDialog
                                  trigger={(
                                    <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                      <Trash2 className="h-3.5 w-3.5" />
                                      Delete
                                    </Button>
                                  )}
                                  title="Delete this anonymous link?"
                                  description="This will remove the file from storage, delete the database record, and remove it from this browser's local history."
                                  confirmLabel="Delete link"
                                  destructiveClassName="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onConfirm={() => removeLink(item.id)}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
