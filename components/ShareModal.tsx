'use client'

import { useState, useRef, useEffect } from 'react'
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
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import QRCode from 'react-qr-code'
import { shareSocials } from '@/data/shareSocials'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { copyTextToClipboard } from '@/lib/clipboard'
import { FILE_ERRORS } from '@/lib/messages'
import type { ShareModalProps } from '@/types/components'

async function copyLink(url: string, successMessage = 'Link copied!') {
  const copied = await copyTextToClipboard(url)
  if (copied) {
    toast.success(successMessage)
  } else {
    toast.error(FILE_ERRORS.failedToCopyLink)
  }
}

export default function ShareModal({ open, onOpenChange, fileUrl, filename }: ShareModalProps) {
  const [showQR, setShowQR] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [qrSize, setQrSize] = useState(500)
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleShare = async (option: (typeof shareSocials)[0]) => {
    switch (option.id) {
      case 'copy':
        await copyLink(fileUrl, 'Link copied to clipboard!')
        break
      case 'twitter':
        if (option.shareUrl) {
          window.open(option.shareUrl(fileUrl, filename), '_blank')
          toast.success('Shared on X!')
        }
        break
      case 'linkedin':
        if (option.shareUrl) {
          window.open(option.shareUrl(fileUrl, filename), '_blank')
          toast.success('Shared on LinkedIn!')
        }
        break
      case 'facebook':
        if (option.shareUrl) {
          window.open(option.shareUrl(fileUrl, filename), '_blank')
          toast.success('Shared on Facebook!')
        }
        break
      case 'whatsapp':
        if (option.shareUrl) {
          window.open(option.shareUrl(fileUrl, filename), '_blank')
          toast.success('Shared on WhatsApp!')
        }
        break
      case 'telegram':
        if (option.shareUrl) {
          window.open(option.shareUrl(fileUrl, filename), '_blank')
          toast.success('Shared on Telegram!')
        }
        break
      case 'email': {
        const subject = `Shared file: ${filename}`
        const body = `I wanted to share this file with you:\n\n${filename}\n\nDownload link: ${fileUrl}`
        window.open(
          `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
          '_self'
        )
        toast.success('Opening email client!')
        break
      }
    }
  }

  const handleFullscreen = async () => {
    setShowQR(false)
    setIsFullscreen(true)
    setQrSize(500)

    try {
      if (fullscreenRef.current?.requestFullscreen) {
        await fullscreenRef.current.requestFullscreen()
      } else {
        toast.error('Fullscreen not supported in this browser')
        setIsFullscreen(false)
        setShowQR(true)
      }
    } catch {
      toast.error('Could not enter fullscreen')
      setIsFullscreen(false)
      setShowQR(true)
    }
  }

  const exitFullscreen = () => {
    setIsFullscreen(false)
    setShowQR(true)

    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {
        toast.error('Could not exit fullscreen')
      })
    }
  }

  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false)
        setShowQR(true)
      }
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [isFullscreen])

  // Ctrl + wheel / pinch to zoom the QR in fullscreen
  useEffect(() => {
    if (!isFullscreen) return
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      setQrSize((s) => Math.min(900, Math.max(120, s - e.deltaY)))
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [isFullscreen])

  return (
    <>
      {/* ============ Main share dialog ============ */}
      <Dialog open={open && !isFullscreen} onOpenChange={onOpenChange}>
        <DialogContent className="gap-0 overflow-hidden rounded-4xl border border-border/60 bg-card/80 p-0 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:max-w-lg">
          <div className="border-b border-border/50 p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight text-foreground">
                <div className="flex size-9 items-center justify-center rounded-full bg-accent/10">
                  <Share2 className="size-4 text-accent" />
                </div>
                Share this file
              </DialogTitle>
              <DialogDescription className="pl-12 text-sm text-muted-foreground">
                Copy the link or choose where you want to share it.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-5 p-6">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Link2 className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{filename}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Ready to share</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Link2 className="size-3.5 text-accent" />
                Shareable link
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/20 p-1">
                <input
                  type="text"
                  value={fileUrl}
                  readOnly
                  title="Click to copy link"
                  aria-label="Shareable link. Click to copy"
                  onClick={() => void copyLink(fileUrl, 'Link copied to clipboard!')}
                  className="min-w-0 flex-1 cursor-pointer truncate rounded px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors hover:text-accent"
                />
                <Button
                  size="sm"
                  variant="outline"
                  aria-label="Copy shareable link"
                  onClick={() => void copyLink(fileUrl, 'Link copied to clipboard!')}
                  className="h-8 shrink-0 rounded-full bg-background px-3 text-xs"
                >
                  <Copy className="size-3.5" />
                  Copy link
                </Button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQR(true)}
              aria-label="Show QR code for this file"
              className="group flex h-auto w-full cursor-pointer items-center justify-between rounded-2xl border border-accent/20 p-4 text-left transition-all hover:border-accent/30 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-accent"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-accent/10">
                  <QrCode className="size-4 text-accent" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">QR code</p>
                  <p className="text-xs text-muted-foreground">Scan with your camera</p>
                </div>
              </div>
              <ExternalLink className="size-4 text-muted-foreground transition-colors group-hover:text-accent" />
            </button>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Share2 className="size-3.5 text-accent" />
                Share with
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {shareSocials.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-label={`Share via ${option.name}`}
                    onClick={() => void handleShare(option)}
                    className={`flex h-auto cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3 font-medium active:scale-95 focus-visible:outline-2 focus-visible:outline-accent ${option.className}`}
                  >
                    {option.platform ? (
                      <SocialIcon
                        platform={option.platform}
                        className={`h-4 w-4 ${option.iconColor}`}
                      />
                    ) : (
                      <div
                        className={`h-5 w-5 flex items-center justify-center ${option.iconColor}`}
                      >
                        {option.id === 'copy' ? (
                          <Copy className="h-4 w-4" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </div>
                    )}
                    <span className="text-xs leading-tight text-center line-clamp-2">
                      {option.name}
                    </span>
                  </button>
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
              <button
                type="button"
                onClick={handleFullscreen}
                aria-label="Open QR code in fullscreen"
                title="Open fullscreen"
                className="group relative cursor-pointer rounded-2xl border border-border bg-white p-6 shadow-sm focus-visible:outline-2 focus-visible:outline-accent"
              >
                <QRCode value={fileUrl} size={180} level="H" />
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Maximize2 className="size-5" />
                  <span className="text-xs font-semibold">View fullscreen</span>
                </span>
              </button>
              <div className="mt-6 text-center">
                <p className="text-sm font-semibold text-foreground break-all">{fileUrl}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Scan with your camera app to access this file
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============ Fullscreen overlay ============ */}
      <div
        ref={fullscreenRef}
        aria-hidden={!isFullscreen}
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-background p-6 transition-opacity ${
          isFullscreen ? 'opacity-100' : 'pointer-events-none invisible opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={exitFullscreen}
          aria-label="Exit fullscreen"
          title="Exit fullscreen"
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
            type="button"
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
            type="button"
            onClick={() => setQrSize((s) => Math.min(900, s + 40))}
            aria-label="Increase QR size"
            className="h-9 w-9 shrink-0 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <span className="mt-2 text-xs text-muted-foreground tabular-nums">{qrSize}px</span>

        <Button
          onClick={exitFullscreen}
          className="mt-4 w-full max-w-xs h-11 px-6 gap-2 cursor-pointer"
        >
          <Minimize2 className="h-4 w-4" />
          Exit fullscreen
        </Button>
      </div>
    </>
  )
}
