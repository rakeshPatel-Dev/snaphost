'use client';

import { useState } from 'react';
import {
  Share2,
  QrCode,
  Link2,
  Clock,
  CheckCircle2,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { shareSocials } from '@/data/shareSocials';
import type { ShareModalProps } from '@/types/components';

export default function ShareModal({
  open,
  onOpenChange,
  fileUrl,
  filename,
}: ShareModalProps) {
  const [showQR, setShowQR] = useState(false);

  const handleShare = (option: (typeof shareSocials)[0]) => {
    switch (option.id) {
      case 'copy':
        navigator.clipboard.writeText(fileUrl);
        toast.success('Link copied to clipboard!');
        break;
      case 'twitter':
        if (option.shareUrl) {
          window.open(option.shareUrl(fileUrl, filename), '_blank');
          toast.success('Shared on X!');
        }
        break;
      case 'linkedin':
        if (option.shareUrl) {
          window.open(option.shareUrl(fileUrl, filename), '_blank');
          toast.success('Shared on LinkedIn!');
        }
        break;
      case 'facebook':
        if (option.shareUrl) {
          window.open(option.shareUrl(fileUrl, filename), '_blank');
          toast.success('Shared on Facebook!');
        }
        break;
      case 'whatsapp':
        if (option.shareUrl) {
          window.open(option.shareUrl(fileUrl, filename), '_blank');
          toast.success('Shared on WhatsApp!');
        }
        break;
      case 'telegram':
        if (option.shareUrl) {
          window.open(option.shareUrl(fileUrl, filename), '_blank');
          toast.success('Shared on Telegram!');
        }
        break;
      case 'email': {
        const subject = `Shared file: ${filename}`;
        const body = `I wanted to share this file with you:\n\n${filename}\n\nDownload link: ${fileUrl}`;
        window.open(
          `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
          '_self',
        );
        toast.success('Opening email client!');
        break;
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-0 gap-0 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] overflow-hidden">
          <div className="p-6 pb-4 border-b border-border/50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
                  <Share2 className="h-4 w-4 text-accent" />
                </div>
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  Share this file
                </span>
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/60">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">File</p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {filename}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
                <Link2 className="h-3.5 w-3.5 text-accent" />
                Shareable link
              </label>
              <div className="flex items-center gap-2 p-1 rounded-2xl bg-muted/20 border border-border/60">
                <input
                  type="text"
                  value={fileUrl}
                  readOnly
                  title="Shareable link"
                  aria-label="Shareable link"
                  className="flex-1 text-xs bg-transparent rounded px-3 py-2 outline-none truncate font-mono text-foreground"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(fileUrl);
                    toast.success('Link copied!');
                  }}
                  className="shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <button
              onClick={() => setShowQR(true)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-accent/5 border border-accent/20 hover:border-accent/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
                  <QrCode className="h-4 w-4 text-accent" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">QR code</p>
                  <p className="text-xs text-muted-foreground">
                    Scan with your camera
                  </p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </button>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
                <Share2 className="h-3.5 w-3.5 text-accent" />
                Share via social media
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {shareSocials.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleShare(option)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl transition-all font-medium hover:shadow-md active:scale-95 ${option.className}`}
                  >
                    <option.icon className={`h-5 w-5 ${option.iconColor}`} />
                    <span className="text-xs leading-tight text-center line-clamp-2">
                      {option.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Encrypted link</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Expires in 24 hours</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-0 gap-0 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)]">
          <div className="p-8">
            <h3 className="text-lg font-semibold tracking-tight text-foreground mb-6">
              Scan QR code
            </h3>

            <div className="flex flex-col items-center">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
                <QRCode value={fileUrl} size={180} level="H" />
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm font-semibold text-foreground">{filename}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Scan with your camera app to access this file
                </p>
              </div>
              <Button
                size="lg"
                className="mt-6 w-full h-11 px-6 gap-2 cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(fileUrl);
                  toast.success('Link copied!');
                  setShowQR(false);
                }}
              >
                <Copy className="h-4 w-4" />
                Copy link instead
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
