'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Share2,
  QrCode,
  Link2,
  ExternalLink,
  Copy,
  Mail,
  Maximize2,
  X,
  Minus,
  Plus,
  Minimize2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { shareSocials } from '@/data/shareSocials';
import { SocialIcon } from '@/components/ui/SocialIcon';
import type { ShareModalProps } from '@/types/components';

export default function ShareModal({
  open,
  onOpenChange,
  fileUrl,
  filename,
}: ShareModalProps) {
  const [showQR, setShowQR] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qrSize, setQrSize] = useState(500);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleFullscreen = async () => {
    setShowQR(false);
    setIsFullscreen(true);
    setQrSize(500);

    // Wait for the overlay to mount before fullscreening it.
    await new Promise((r) => setTimeout(r, 50));

    try {
      if (fullscreenRef.current?.requestFullscreen) {
        await fullscreenRef.current.requestFullscreen();
      } else {
        toast.error('Fullscreen not supported in this browser');
        setIsFullscreen(false);
      }
    } catch {
      toast.error('Could not enter fullscreen');
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
    setIsFullscreen(false);
  };

  // Unmount overlay when the user exits fullscreen via Esc / browser UI
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Ctrl + wheel / pinch to zoom the QR in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setQrSize((s) => Math.min(900, Math.max(120, s - e.deltaY)));
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isFullscreen]);

  return (
    <>
      {/* ============ Main share dialog ============ */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg rounded-4xl border border-border/60 bg-card/80 backdrop-blur-xl p-0 gap-0 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] overflow-hidden">
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
                  aria-label="Copy shareable link"
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

            <div
              onClick={() => setShowQR(true)}
              aria-label="Show QR code for this file"
              className="w-full flex rounded-full items-center justify-between p-4   border border-accent/20 hover:border-accent/30 hover:shadow-sm transition-all group h-auto"
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
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
                <Share2 className="h-3.5 w-3.5 text-accent" />
                Share via social media
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {shareSocials.map((option) => (
                  <div
                    key={option.id}
                    aria-label={`Share via ${option.name}`}
                    onClick={() => handleShare(option)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-3xl! cursor-pointer hover:bg-accent/20 font-medium  active:scale-95 h-auto ${option.className}`}
                  >
                    {option.platform ? (
                      <SocialIcon platform={option.platform} className={`h-4 w-4 ${option.iconColor}`} />
                    ) : (
                      <div className={`h-5 w-5 flex items-center justify-center ${option.iconColor}`}>
                        {option.id === 'copy' ? <Copy className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                      </div>
                    )}
                    <span className="text-xs leading-tight text-center line-clamp-2">
                      {option.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============ QR code dialog ============ */}
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
                <p className="text-sm font-semibold text-foreground break-all">
                  {fileUrl}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Scan with your camera app to access this file
                </p>
              </div>

              <div className="mt-6 w-full flex flex-col gap-2">

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-11 px-6 gap-2 cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(fileUrl);
                    toast.success('Link copied!');
                    setShowQR(false);
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy link instead
                </Button>

                <Button
                  size="lg"
                  className="w-full h-11 px-6 gap-2 cursor-pointer"
                  onClick={handleFullscreen}
                >
                  <Maximize2 className="h-4 w-4" />
                  View fullscreen
                </Button>


              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============ Fullscreen overlay ============ */}
      {isFullscreen && (
        <div
          ref={fullscreenRef}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 overflow-hidden"
        >
          <button
            onClick={exitFullscreen}
            aria-label="Exit fullscreen"
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Resizable / scrollable QR area */}
          <div
            ref={scrollRef}
            className="flex-1 w-full overflow-auto flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-3xl shadow-lg border border-border shrink-0 transition-[padding] duration-150"
              style={{ padding: `${Math.max(12, qrSize * 0.08)}px` }}
            >
              <QRCode value={fileUrl} size={qrSize} level="H" />
            </div>
          </div>

          <p className="mt-4 text-sm font-semibold text-foreground break-all text-center max-w-md">
            {fileUrl}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Scan with your camera app to access this file
          </p>

          {/* Resize controls */}
          <div className="mt-5 w-full max-w-md flex items-center gap-3 px-4">
            <button
              onClick={() => setQrSize((s) => Math.max(120, s - 40))}
              aria-label="Decrease QR size"
              className="h-9 w-9 shrink-0 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>

            <input
              type="range"
              min={120}
              max={900}
              step={10}
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              aria-label="QR code size"
              className="flex-1 accent-accent cursor-pointer"
            />

            <button
              onClick={() => setQrSize((s) => Math.min(900, s + 40))}
              aria-label="Increase QR size"
              className="h-9 w-9 shrink-0 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <span className="mt-2 text-xs text-muted-foreground tabular-nums">
            {qrSize}px
          </span>

          <Button
            onClick={exitFullscreen}
            className="mt-4 w-full max-w-xs h-11 px-6 gap-2 cursor-pointer"
          >
            <Minimize2 className="h-4 w-4" />
            Exit fullscreen
          </Button>
        </div>
      )}
    </>
  );
}