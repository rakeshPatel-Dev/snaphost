import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { ShineBorder } from '@/components/ui/shine-border'

const AnnouncementContent = {
    title: 'Multiple file upload',
    description: 'Upload now',
    link: '/upload',
}

const AnnouncementPill = () => {
    return (
        <Link
            href={AnnouncementContent.link}
            className="group relative inline-flex items-center gap-2 rounded-full h-10 px-3 text-xs font-medium text-foreground mb-8 bg-muted/20 backdrop-blur-md border border-border/60 overflow-hidden"
        >
            {/* Traveling shine on the border */}
            <ShineBorder
                borderWidth={1}
                duration={6}
                shineColor={['transparent', 'var(--accent)', 'transparent']}
            />

            {/* Content */}
            <Button
                size="xs"
                className="relative rounded-full bg-accent px-2 text-xs font-semibold uppercase tracking-wider text-accent-foreground pointer-events-none"
            >
                New
            </Button>

            <span className="relative font-medium tracking-tight">
                {AnnouncementContent.title}
            </span>

            <span className="relative text-muted-foreground">•</span>

            <span className="relative text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
                {AnnouncementContent.description}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
        </Link>
    )
}

export default AnnouncementPill