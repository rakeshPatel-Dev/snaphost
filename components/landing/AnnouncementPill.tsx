import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { ShineBorder } from '@/components/ui/shine-border'

const AnnouncementContent = {
  title: 'Snaphost Beta is live!',
  description: 'Upload now',
  link: '/upload',
}

const AnnouncementPill = () => {
  return (
    <Link
      href={AnnouncementContent.link}
      className="group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-full border border-border/60 bg-muted/70 px-3 text-xs font-medium text-foreground mb-8 sm:bg-muted/20 sm:backdrop-blur-md"
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
        Beta
      </Button>

      <span className="relative font-medium tracking-tight">{AnnouncementContent.title}</span>

      <span className="relative text-muted-foreground">•</span>

      <span className="relative text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
        {AnnouncementContent.description}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export default AnnouncementPill
