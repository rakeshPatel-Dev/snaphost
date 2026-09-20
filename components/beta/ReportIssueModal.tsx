'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { Bug, Check, ImagePlus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatFileSize } from '@/shared/utils/file-format';

type ReportIssueModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Screenshot = {
  file: File;
  url: string | null;
};

export default function ReportIssueModal({ open, onOpenChange }: ReportIssueModalProps) {
  const [state, handleSubmit, resetForm] = useForm(
    process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT_ID || 'missing-id'
  );
  const [screenshot, setScreenshot] = useState<Screenshot | null>(null);
  const [submitFailed, setSubmitFailed] = useState(false);
  const screenshotUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (screenshotUrlRef.current) {
        URL.revokeObjectURL(screenshotUrlRef.current);
      }
    },
    []
  );

  const selectScreenshot = (file: File | null) => {
    if (screenshotUrlRef.current) {
      URL.revokeObjectURL(screenshotUrlRef.current);
      screenshotUrlRef.current = null;
    }
    if (!file) {
      setScreenshot(null);
      return;
    }
    const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    screenshotUrlRef.current = url;
    setScreenshot({ file, url });
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      resetForm();
      setSubmitFailed(false);
    } else {
      selectScreenshot(null);
    }
    onOpenChange(next);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await handleSubmit(e);
    } catch {
      setSubmitFailed(true);
    }
  };

  const hasFormError = !!state.errors && state.errors.getFormErrors().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-4xl border border-border/60 bg-card/80 p-0 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:max-w-lg">
        {state.succeeded ? (
          <div className="flex flex-col items-center px-6 py-12 text-center sm:px-10">
            <div className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Check className="size-6" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
              Report sent
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Thanks for reporting this — our team will look into the issue you encountered.
            </p>
            <Button onClick={() => handleOpenChange(false)} className="mt-8 h-10 w-full px-4 sm:w-auto">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="border-b border-border/50 px-6 pb-4 pt-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-accent/10">
                    <Bug className="size-4 text-accent" aria-hidden="true" />
                  </div>
                  <span className="text-base font-semibold tracking-tight text-foreground">
                    Report an issue
                  </span>
                </DialogTitle>
                <DialogDescription className="pt-1">
                  Something broken while you used Snaphost? Tell us what happened.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="report-message">
                  What happened? <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="report-message"
                  name="message"
                  className="min-h-24"
                  required
                  autoFocus
                />
                <ValidationError prefix="Message" field="message" errors={state.errors} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-context">What were you trying to do? <span className="text-muted-foreground">(optional)</span></Label>
                <Textarea
                  id="report-context"
                  name="context"
                  className="min-h-16"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-email">Email <span className="text-muted-foreground">(optional)</span></Label>
                <Input
                  id="report-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                />
                <ValidationError prefix="Email" field="email" errors={state.errors} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-screenshot">Screenshot <span className="text-muted-foreground">(optional)</span></Label>
                <input
                  id="report-screenshot"
                  name="attachment"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => selectScreenshot(e.target.files?.[0] ?? null)}
                />
                {screenshot ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 px-3 py-2.5">
                    {screenshot.url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local object-URL preview
                      <img
                        src={screenshot.url}
                        alt=""
                        className="size-10 shrink-0 rounded-lg border border-border/60 object-cover"
                      />
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <ImagePlus className="size-4" aria-hidden="true" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{screenshot.file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(screenshot.file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (fileInputRef.current) fileInputRef.current.value = '';
                        selectScreenshot(null);
                      }}
                      aria-label="Remove screenshot"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="report-screenshot"
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-border/70 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                  >
                    <ImagePlus className="size-4" aria-hidden="true" />
                    Attach a screenshot
                  </label>
                )}
              </div>

              {(submitFailed || hasFormError) && (
                <p role="alert" className="text-sm text-destructive">
                  Something went wrong sending your report. Please try again.
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border/50 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="h-10 w-full px-4 sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={state.submitting} className="h-10 w-full px-4 sm:w-auto">
                {state.submitting ? 'Sending…' : 'Send report'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}