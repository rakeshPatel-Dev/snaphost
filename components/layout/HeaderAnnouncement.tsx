"use client";
import { CircleX, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Announcement from '@/components/landing/Announcement';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function HeaderAnnouncement() {

    const [isAnnouncementClosed, setIsAnnouncementClosed] = useState(false); // This should be managed with state to allow closing the announcement

    return (
        <div
            style={{ display: isAnnouncementClosed ? 'none' : 'flex' }}
            className="flex  items-center justify-center relative gap-2 bg-background/80 px-4 py-1.5 text-xs text-muted-foreground border-b border-border/40">
            <div className="flex items-center gap-1">


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
            {/* close the announcement */}
            <button
                onClick={() => {
                    setIsAnnouncementClosed(true); // This should be handled with state to trigger a re-render and hide the announcement
                }}
                aria-label="Close announcement"
                className="text-muted-foreground cursor-pointer absolute top-2 right-10   hover:text-foreground">
                <span className="sr-only">Close announcement</span>
                <CircleX className="h-3 w-3" />
            </button>
        </div>
    );
}
