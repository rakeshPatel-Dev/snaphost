import { Button } from '@/components/ui/button';
import { SocialIcon, SocialPlatform } from '@/components/ui/SocialIcon';

const socials: { platform?: SocialPlatform; href: string; label: string; iconFallback?: any }[] = [
  { platform: 'github', href: 'https://github.com/snaphost', label: 'GitHub' },
  { platform: 'twitter', href: 'https://twitter.com/snaphost', label: 'Twitter' },
  { platform: 'linkedin', href: 'https://linkedin.com/company/snaphost', label: 'LinkedIn' },
  { platform: 'instagram', href: 'https://instagram.com/snaphost', label: 'Instagram' },
];

export default function SocialButtons({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1 mt-1">
        {socials.map(({ platform, href, label }, index) => (
          <Button
            key={label}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            asChild
          >
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
              {platform ? (
                <SocialIcon platform={platform} className="h-4 w-4" />
              ) : (
                <span className="h-4 w-4" />
              )}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
