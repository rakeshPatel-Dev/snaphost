'use client';

import { useState } from 'react';
import { 
  Share2, X,
  QrCode, Link2, Clock, CheckCircle2, ExternalLink, Copy
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { shareSocials } from '@/data/shareSocials';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  filename: string;
  fileSize?: string;
}

export default function ShareModal({ 
  open, 
  onOpenChange, 
  fileUrl, 
  filename,
  fileSize = '2.4 MB',
}: ShareModalProps) {
  const [showQR, setShowQR] = useState(false);

  const handleShare = (option: typeof shareSocials[0]) => {
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
      case 'email':
        const subject = `Shared file: ${filename}`;
        const body = `I wanted to share this file with you:\n\n${filename}\nSize: ${fileSize}\n\nDownload link: ${fileUrl}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        toast.success('Opening email client!');
        break;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-border/50 bg-linear-to-r from-primary/5 to-accent/5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-linear-to-br from-primary to-accent">
                  <Share2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">Share this file</span>
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-5">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">File</p>
                <p className="text-sm font-semibold text-foreground truncate">{filename}</p>
                <p className="text-xs text-muted-foreground mt-1">{fileSize}</p>
              </div>
            </div>

            {/* Share Link */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
                <Link2 className="h-3.5 w-3.5 text-primary" />
                Shareable link
              </label>
              <div className="flex items-center gap-2 p-1 rounded-lg bg-muted/50 border border-border/50">
                <input
                  type="text"
                  value={fileUrl}
                  readOnly
                  className="flex-1 text-xs bg-transparent rounded px-3 py-2 outline-none truncate font-mono text-foreground"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(fileUrl);
                    toast.success('Link copied!');
                  }}
                  className="shrink-0 hover:bg-muted text-muted-foreground"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* QR Code Button */}
            <button
              onClick={() => setShowQR(true)}
              className="w-full flex items-center justify-between p-4 rounded-lg bg-linear-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-linear-to-br from-primary to-accent shadow-sm group-hover:shadow-md transition-all">
                  <QrCode className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">QR Code</p>
                  <p className="text-xs text-muted-foreground">Scan with your camera</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>

            {/* Social Share Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
                <Share2 className="h-3.5 w-3.5 text-primary" />
                Share via social media
              </label>
              <div className="grid grid-cols-4 gap-2">
                {shareSocials.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleShare(option)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg transition-all font-medium hover:scale-110 hover:shadow-md active:scale-95 ${option.className}`}
                  >
                    <option.icon className={`h-5 w-5 ${option.iconColor}`} />
                    <span className="text-[10px] leading-tight text-center line-clamp-2">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 text-[11px] text-muted-foreground border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Encrypted link</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Expires in 30 days</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Popup Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm p-0 gap-0">
          <div className="p-8 bg-linear-to-b from-primary/5 to-background rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-6">Scan QR Code</h3>
            
            <div className="flex flex-col items-center">
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-border">
                <QRCode value={fileUrl} size={180} level="H" />
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm font-semibold text-foreground">{filename}</p>
                <p className="text-xs text-muted-foreground mt-2">Scan with your camera app to access this file</p>
              </div>
              <Button
                size="sm"
                className="mt-6 w-full gap-2 bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                onClick={() => {
                  navigator.clipboard.writeText(fileUrl);
                  toast.success('Link copied!');
                  setShowQR(false);
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy link instead
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}