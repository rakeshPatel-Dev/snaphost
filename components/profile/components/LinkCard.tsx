import React from 'react'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Copy, ExternalLink, File, FileImage, Link2, Save, Trash2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import type { AppFile } from '@/types/app';
import { buildPublicFileUrl } from '@/lib/public-file-url';
import { CONFIG } from '@/lib/config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ExpirationPreset = '1d' | '7d' | '1m' | 'never';

function getExpirationPreset(expiresAt: string | null): ExpirationPreset {
  if (!expiresAt) return 'never';
  const expiresAtTime = new Date(expiresAt).getTime();
  const diffMs = expiresAtTime - Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  if (diffMs <= oneDayMs * 2) return '1d';
  if (diffMs <= oneDayMs * 10) return '7d';
  return '1m';
}

function getExpiresAtFromPreset(preset: ExpirationPreset): string | null {
  if (preset === 'never') return null;
  const nextDate = new Date();
  if (preset === '1d') nextDate.setDate(nextDate.getDate() + 1);
  else if (preset === '7d') nextDate.setDate(nextDate.getDate() + 7);
  else nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate.toISOString();
}

type LinkCardProps = {
  username: string;
  files: AppFile[];
  isPremium: boolean;
  editingFileId: string | null;
  copiedId: string | null;
  setFiles: React.Dispatch<React.SetStateAction<AppFile[]>>;
  onCopyLink: (url: string, id: string) => void;
  onSaveFile: (file: AppFile) => void;
  onDeleteFile: (fileId: string) => void;
};

const LinkCard = ({
  username,
  files,
  isPremium,
  editingFileId,
  copiedId,
  setFiles,
  onCopyLink,
  onSaveFile,
  onDeleteFile,
}: LinkCardProps) => {
  return (
    <div className="font-sans">
      <Card className="shadow-none border border-border/60 rounded-[18px] overflow-hidden">

        {/* ── Header ── */}
        <CardHeader className="pb-3 pt-4 px-5 bg-muted/40 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-[13.5px] font-semibold tracking-tight">
                Your links
              </CardTitle>
              <CardDescription className="text-[12.5px] text-muted-foreground">
                {files.length} {files.length === 1 ? 'link' : 'links'} — rename, set expiry, copy or delete.
              </CardDescription>
            </div>
            {files.length > 0 && (
              <Badge
                variant="secondary"
                className="text-[11px] font-semibold font-mono px-2.5 py-0.5 rounded-full"
              >
                {files.length} / {isPremium ? '∞' : '5'}
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* ── Body ── */}
        <CardContent className="p-4 space-y-3">
          {files.length === 0 ? (

            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 py-14">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background border border-border shadow-sm">
                <Link2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-[13.5px] font-semibold text-foreground">No uploads yet</p>
                <p className="text-xs text-muted-foreground">Files you upload will appear here.</p>
              </div>
              <Button
                size="sm"
                className="h-8 mt-1 gap-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white border-0 rounded-lg"
                asChild
              >
                <Link href="/upload">
                  <Zap className="h-3 w-3" />
                  Upload your first file
                </Link>
              </Button>
            </div>

          ) : (
            files.map((file) => {
              const isEditing = editingFileId === file.id;
              const isCopied = copiedId === file.id;
              const FileIcon = file.file_type === 'pdf' ? File : FileImage;
              const isPdf = file.file_type === 'pdf';

              const resolvedPublicUrl = buildPublicFileUrl({
                baseUrl: CONFIG.BASE_URL,
                slug: file.slug,
                username,
                uploadType: file.upload_type,
              });
              const expirationPreset = getExpirationPreset(file.expires_at);
              const isNeverExpiring = expirationPreset === 'never';

              function setExpirationPreset(preset: ExpirationPreset) {
                const nextExpiration = getExpiresAtFromPreset(preset);
                setFiles((currentFiles) =>
                  currentFiles.map((item) =>
                    item.id === file.id ? { ...item, expires_at: nextExpiration } : item
                  )
                );
              }

              return (
                <div
                  key={file.id}
                  className="rounded-[14px] border border-border/70 bg-card overflow-hidden transition-all duration-150 hover:border-border hover:shadow-sm"
                >

                  {/* ── File header row ── */}
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-muted/30">
                    <div className={cn(
                      'flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] border',
                      isPdf
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-background border-border text-muted-foreground'
                    )}>
                      <FileIcon className="h-3.5 w-3.5" />
                    </div>

                    <span className="flex-1 min-w-0 truncate text-[13.5px] font-semibold tracking-tight text-foreground">
                      {file.filename}
                    </span>

                    <span className={cn(
                      'shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border',
                      file.upload_type
                        ? 'bg-sky-500/8 border-sky-500/20 text-sky-600 dark:text-sky-400'
                        : 'bg-background border-border text-muted-foreground'
                    )}>
                      {file.upload_type}
                    </span>

                    <span className="shrink-0 text-[11px] text-muted-foreground font-mono">
                      {new Date(file.created_at).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>

                  <Separator />

                  {/* ── Editable fields ── */}
                  <div className="grid gap-2.5 p-3.5 sm:grid-cols-2">

                    {/* Filename */}
                    <div className="grid gap-1.5">
                      <Label className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground/70 flex items-center gap-1">
                        Filename
                      </Label>
                      <Input
                        value={file.filename}
                        onChange={(e) =>
                          setFiles((currentFiles) =>
                            currentFiles.map((item) =>
                              item.id === file.id ? { ...item, filename: e.target.value } : item
                            )
                          )
                        }
                        className="h-8 bg-muted/40 text-[12.5px] rounded-lg border-border/60 focus-visible:ring-1"
                        placeholder="Filename"
                      />
                    </div>

                    {/* Slug */}
                    <div className="grid gap-1.5">
                      <Label className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground/70">
                        Slug
                      </Label>
                      <Input
                        value={file.slug}
                        onChange={(e) =>
                          setFiles((currentFiles) =>
                            currentFiles.map((item) =>
                              item.id === file.id ? { ...item, slug: e.target.value } : item
                            )
                          )
                        }
                        className="h-8 bg-muted/40 text-[12px] font-mono rounded-lg border-border/60 focus-visible:ring-1"
                        placeholder="my-slug"
                      />
                    </div>

                    {/* Expiration */}
                    <div className="grid gap-1.5">
                      <Label className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground/70 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expiration
                      </Label>
                      <Select
                        value={expirationPreset}
                        onValueChange={(value) => setExpirationPreset(value as ExpirationPreset)}
                      >
                        <SelectTrigger className={cn(
                          'h-8 bg-muted/40 text-[12.5px] rounded-lg border-border/60 focus:ring-1',
                          isNeverExpiring && 'text-emerald-600 dark:text-emerald-400 font-medium'
                        )}>
                          <SelectValue placeholder="Select expiration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1d">1 day</SelectItem>
                          <SelectItem value="7d">7 days</SelectItem>
                          <SelectItem value="1m">1 month</SelectItem>
                          <SelectItem value="never" className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Never
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Public URL */}
                    <div className="grid gap-1.5">
                      <Label className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground/70">
                        Public URL
                      </Label>
                      <div className="flex gap-1.5">
                        <Input
                          value={resolvedPublicUrl}
                          readOnly
                          className="h-8 bg-muted/60 text-[11.5px] font-mono text-muted-foreground truncate cursor-text rounded-lg border-border/60 outline-none   flex-1 min-w-0"
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 shrink-0 rounded-lg border-border/60 bg-muted/40 hover:bg-background"
                              onClick={() =>
                                window.open(resolvedPublicUrl, '_blank', 'noopener,noreferrer')
                              }
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Open link</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                  </div>

                  {/* ── Action footer ── */}
                  <div className="flex items-center gap-2 border-t border-border/50 bg-muted/30 px-3.5 py-2.5 rounded-b-[14px]">

                    {/* Copy */}
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        'h-7 gap-1.5 text-xs font-medium rounded-lg border-border/60',
                        isCopied
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15'
                          : 'bg-background hover:bg-muted/50'
                      )}
                      onClick={() => onCopyLink(resolvedPublicUrl, file.id)}
                    >
                      {isCopied ? (
                        <><Check className="h-3 w-3" /> Copied</>
                      ) : (
                        <><Copy className="h-3 w-3" /> Copy link</>
                      )}
                    </Button>

                    {/* Save */}
                    <Button
                      size="sm"
                      className="h-7 gap-1.5 text-xs font-semibold rounded-lg 0 shadow-none"
                      onClick={() => onSaveFile(file)}
                      disabled={isEditing}
                    >
                      <Save className="h-3 w-3" />
                      {isEditing ? 'Saving…' : 'Save'}
                    </Button>

                    {/* Active indicator */}
                    <div className="flex items-center gap-1.5 ml-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] text-muted-foreground">Active</span>
                    </div>

                    {/* Delete */}
                    <div className="ml-auto">
                      <DeleteConfirmDialog
                        trigger={(
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                            disabled={isEditing}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        )}
                        title="Delete this link?"
                        description={
                          <>
                            <strong>{file.filename}</strong> will be permanently removed.
                            Anyone with the link will no longer be able to access it.
                          </>
                        }
                        confirmLabel="Delete link"
                        destructiveClassName="bg-red-600 text-white hover:bg-red-700"
                        onConfirm={() => onDeleteFile(file.id)}
                      />
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkCard;