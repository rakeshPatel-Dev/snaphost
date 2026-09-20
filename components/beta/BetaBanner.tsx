'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, FlaskConical, X } from 'lucide-react';
import ReportIssueModal from './ReportIssueModal';

const BETA_BANNER_DISMISS_KEY = 'snaphost:beta-banner-dismissed';

export default function BetaBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(window.localStorage.getItem(BETA_BANNER_DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed) {
    return null;
  }

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(BETA_BANNER_DISMISS_KEY, '1');
    } catch {
      // Ignore storage failures (e.g. private browsing).
    }
  };

  return (
    <>
      <div
        role="region"
        aria-label="Beta notice"
        className="relative z-40 border-b border-border/60 bg-muted/40"
      >
        <div className="mx-auto flex min-h-9 max-w-5xl items-center gap-2 px-4 py-1.5 sm:px-6">
          <FlaskConical className="size-4 shrink-0 text-foreground/50" aria-hidden="true" />
          <p className="min-w-0 flex-1 truncate text-xs leading-5 text-foreground/75">
            Snaphost is currently in beta. You may encounter bugs or unexpected behavior.
          </p>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            Report an issue
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss beta notice"
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ReportIssueModal open={reportOpen} onOpenChange={setReportOpen} />
    </>
  );
}