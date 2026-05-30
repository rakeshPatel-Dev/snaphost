import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import Announcement from '@/components/landing/Announcement';
import { Badge } from '@/components/ui/badge';

export default function HeaderAnnouncement() {
    return (
        <div className="flex items-center justify-center gap-2 bg-background/80 px-4 py-1.5 text-xs text-muted-foreground border-b border-border/40">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>
                Introducing{' '}
                <Link href="/upload" className="font-semibold text-foreground underline-offset-4 hover:underline">
                    <Announcement />
                </Link>{' '}
                — cleaner links, faster uploads.
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                New
            </Badge>
        </div>
    );
}
