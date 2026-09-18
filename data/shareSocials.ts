import { SocialPlatform } from '@/components/ui/SocialIcon';

interface ShareOption {
  id: string;
  name: string;
  platform?: SocialPlatform;
  icon?: any;
  className: string;
  iconColor: string;
  shareUrl?: (fileUrl: string, filename: string, fileSize?: string) => string;
}

// Optional third arg lets you pass size, e.g. "2.4 MB"
// so messages can say "a 2.4 MB file" instead of just "a file".

const surface =
  'bg-muted/30 hover:bg-muted/60 text-foreground border border-border/60 hover:border-border transition-colors';

// Human-friendly file description
const describeFile = (filename: string, fileSize?: string) =>
  fileSize ? `${filename} (${fileSize})` : filename;

export const shareSocials: ShareOption[] = [
  {
    id: 'twitter',
    name: 'X (Twitter)',
    platform: 'twitter',
    className: surface,
    iconColor: 'text-foreground',
    shareUrl: (fileUrl, filename, fileSize) => {
      const text = `Sharing ${describeFile(filename, fileSize)}`;
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fileUrl)}`;
    },
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    platform: 'linkedin',
    className: surface,
    iconColor: 'text-foreground',
    shareUrl: (fileUrl, filename) => {
      // LinkedIn's share endpoint only accepts a URL — no custom text.
      // The OG tags on the target page are what populate the preview.
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fileUrl)}`;
    },
  },
  {
    id: 'facebook',
    name: 'Facebook',
    platform: 'facebook',
    className: surface,
    iconColor: 'text-foreground',
    shareUrl: (fileUrl, filename) => {
      // Facebook's sharer also ignores custom text. Quote is honored though.
      const quote = `Sharing ${filename}`;
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fileUrl)}&quote=${encodeURIComponent(quote)}`;
    },
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    platform: 'whatsapp',
    className: surface,
    iconColor: 'text-foreground',
    shareUrl: (fileUrl, filename, fileSize) => {
      const text = `Hey — here's ${describeFile(filename, fileSize)}:\n${fileUrl}`;
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    },
  },
  {
    id: 'telegram',
    name: 'Telegram',
    platform: 'telegram',
    className: surface,
    iconColor: 'text-foreground',
    shareUrl: (fileUrl, filename) => {
      const text = `Sharing ${filename}`;
      return `https://t.me/share/url?url=${encodeURIComponent(fileUrl)}&text=${encodeURIComponent(text)}`;
    },
  },
  {
    id: 'email',
    name: 'Email',
    className: surface,
    iconColor: 'text-muted-foreground group-hover:text-foreground transition-colors',
  },
];