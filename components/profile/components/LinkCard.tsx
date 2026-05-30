import React from 'react'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Copy, ExternalLink, File, FileImage, Link2, Save, Trash2 } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import type { AppFile } from '@/types/app';
import { buildPublicFileUrl } from '@/lib/public-file-url';
import { CONFIG } from '@/lib/config';
import { format, parseISO } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

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
    <div>
      {/* --- Links card --- */}
      <Card className="shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Your links</CardTitle>
              <CardDescription className="text-sm">
                {files.length} {files.length === 1 ? 'link' : 'links'} — rename, set expiry, copy or delete.
              </CardDescription>
            </div>
            {files.length > 0 && (
              <Badge variant="secondary" className="text-xs tabular-nums">
                {files.length} / {isPremium ? '∞' : '5'}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 py-12">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Link2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">No uploads yet</p>
                <p className="text-xs text-muted-foreground">Files you upload will appear here.</p>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 h-8 mt-1" asChild>
                <Link href="/upload">Upload your first file</Link>
              </Button>
            </div>
          ) : (
            files.map((file) => {
              const isEditing = editingFileId === file.id;
              const isCopied = copiedId === file.id;
              const FileIcon = file.file_type === 'pdf' ? File : FileImage;
              const resolvedPublicUrl = buildPublicFileUrl({
                baseUrl: CONFIG.BASE_URL,
                slug: file.slug,
                username,
                uploadType: file.upload_type,
              });
              const createdAtDate = parseISO(file.created_at);
              const expirationDate = file.expires_at ? parseISO(file.expires_at) : null;
              const expirationLabel = expirationDate ? format(expirationDate, 'MMM d, yyyy') : 'Pick a date';

              function setExpirationDate(nextDate: Date | undefined) {
                if (!nextDate) {
                  setFiles((currentFiles) =>
                    currentFiles.map((item) => (item.id === file.id ? { ...item, expires_at: null } : item))
                  );
                  return;
                }

                const nextExpiration = new Date(nextDate);
                nextExpiration.setHours(
                  createdAtDate.getHours(),
                  createdAtDate.getMinutes(),
                  createdAtDate.getSeconds(),
                  0
                );

                setFiles((currentFiles) =>
                  currentFiles.map((item) =>
                    item.id === file.id
                      ? { ...item, expires_at: nextExpiration.toISOString() }
                      : item
                  )
                );
              }

              return (
                <div
                  key={file.id}
                  className="group rounded-xl border border-border bg-card transition-colors hover:border-border/80 hover:bg-muted/20"
                >
                  {/* File header row */}
                  <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                    <div className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
                      file.file_type === 'pdf'
                        ? 'border-orange-500/20 bg-orange-500/10 text-orange-500'
                        : 'border-border/20 bg-muted/10 text-foreground'
                    )}>
                      <FileIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                      <span className="truncate text-sm font-medium text-foreground">{file.filename}</span>
                      <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 h-4 capitalize">
                        {file.upload_type}
                      </Badge>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {new Date(file.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <Separator className="mx-4 w-auto" />

                  {/* Editable fields */}
                  <div className="grid gap-3 p-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">Filename</Label>
                      <Input
                        value={file.filename}
                        onChange={(e) =>
                          setFiles((currentFiles) =>
                            currentFiles.map((item) => (item.id === file.id ? { ...item, filename: e.target.value } : item))
                          )
                        }
                        className="h-8 bg-background text-sm"
                        placeholder="Filename"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">Slug</Label>
                      <Input
                        value={file.slug}
                        onChange={(e) =>
                          setFiles((currentFiles) =>
                            currentFiles.map((item) => (item.id === file.id ? { ...item, slug: e.target.value } : item))
                          )
                        }
                        className="h-8 bg-background text-sm font-mono"
                        placeholder="my-slug"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label className={cn(
                        'text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1',
                        !isPremium ? 'text-muted-foreground/40' : 'text-muted-foreground/60'
                      )}>
                        <Clock className="h-3 w-3" />
                        Expiration date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              'h-8 w-full justify-between bg-background text-sm font-normal',
                              !expirationDate && 'text-muted-foreground'
                            )}
                          >
                            <span>{expirationLabel}</span>
                            <CalendarIcon className="h-3.5 w-3.5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                          <div className="flex flex-col gap-2 p-2.5">
                            <Calendar
                              mode="single"
                              selected={expirationDate ?? undefined}
                              onSelect={setExpirationDate}
                              defaultMonth={expirationDate ?? createdAtDate}
                            />
                            <div className="flex items-center flex-col justify-between gap-2 px-1 pb-1">
                              <p className="text-xs text-muted-foreground">
                                Time stays at the upload creation time.
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground"
                                onClick={() => setExpirationDate(undefined)}
                              >
                                Clear
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">Public URL</Label>
                      <div className="flex gap-1.5">
                        <Input
                          value={resolvedPublicUrl}
                          readOnly
                          className="h-8 bg-muted text-sm text-muted-foreground font-mono truncate cursor-text"
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 shrink-0"
                              onClick={() => window.open(resolvedPublicUrl, '_blank')}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Open link</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center gap-2 border-t border-border/60 bg-muted/30 px-4 py-2.5 rounded-b-xl">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1.5 text-xs"
                      onClick={() => onCopyLink(resolvedPublicUrl, file.id)}
                    >
                      {isCopied ? (
                        <><Check className="h-3 w-3 text-green-500" /> Copied</>
                      ) : (
                        <><Copy className="h-3 w-3" /> Copy link</>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 gap-1.5 text-xs"
                      onClick={() => onSaveFile(file)}
                      disabled={isEditing}
                    >
                      <Save className="h-3 w-3" />
                      {isEditing ? 'Saving…' : 'Save'}
                    </Button>

                    <div className="ml-auto">
                      <DeleteConfirmDialog
                        trigger={(
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            disabled={isEditing}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        )}
                        title="Delete this link?"
                        description={<> <strong>{file.filename}</strong> will be permanently removed. Anyone with the link will no longer be able to access it.</>}
                        confirmLabel="Delete link"
                        destructiveClassName="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
  )
}

export default LinkCard
