import { SocialPlatform } from '@/components/ui/SocialIcon';

interface ShareOption {
  id: string;
  name: string;
  platform?: SocialPlatform;
  icon?: any; // Kept for backward compatibility if needed, but we prefer platform
  className: string;
  iconColor: string;
  shareUrl?: (fileUrl: string, filename: string, fileSize?: string) => string;
}

export const shareSocials: ShareOption[] = [
  {
    id: 'copy',
    name: 'Copy Link',
    className: 'bg-muted hover:bg-muted/80 text-foreground border border-border/50 hover:border-border',
    iconColor: 'text-muted-foreground',
    // Copy doesn't have a platform, it's a utility
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    platform: 'twitter',
    className: 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 hover:border-accent/30',
    iconColor: 'text-accent',
    shareUrl: (fileUrl, filename) => {
      const text = `Check out this file: ${filename}`;
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fileUrl)}`;
    },
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    platform: 'linkedin',
    className: 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 hover:border-accent/30',
    iconColor: 'text-accent',
    shareUrl: (fileUrl) => {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fileUrl)}`;
    },
  },
  {
    id: 'facebook',
    name: 'Facebook',
    platform: 'facebook',
    className: 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 hover:border-accent/30',
    iconColor: 'text-accent',
    shareUrl: (fileUrl) => {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fileUrl)}`;
    },
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    platform: 'whatsapp',
    className: 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 hover:border-accent/30',
    iconColor: 'text-accent',
    shareUrl: (fileUrl, filename) => {
      const text = `${filename} - ${fileUrl}`;
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    },
  },
  {
    id: 'telegram',
    name: 'Telegram',
    platform: 'telegram',
    className: 'bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 hover:border-accent/30',
    iconColor: 'text-accent',
    shareUrl: (fileUrl, filename) => {
      return `https://t.me/share/url?url=${encodeURIComponent(fileUrl)}&text=${encodeURIComponent(filename)}`;
    },
  },
  {
    id: 'email',
    name: 'Email',
    className: 'bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 hover:border-destructive/30',
    iconColor: 'text-destructive',
  },
];
