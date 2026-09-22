import type { AnonymousLink } from '@/types/app'
import { SITE_URL } from '@/data/emails'

export const demoAnonymousLinkUrl = `${SITE_URL}/anon/sh_7y2b1x`

/**
 * Demo link with fresh timestamps. Called from a client component after mount
 * (not at module scope) so server and client never render different dates,
 * avoiding React hydration mismatches in the motion previews.
 */
export function getDemoAnonymousLink(): AnonymousLink {
  return {
    id: 'demo-anon-link',
    filename: 'mockup.png',
    fileType: 'image',
    fileSize: '2.4 MB',
    url: demoAnonymousLinkUrl,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

export const noop = () => {}

export function reveal(text: string, t: number, start: number, end: number) {
  if (t < start) return ''
  if (t >= end) return text
  const progress = (t - start) / (end - start)
  return text.slice(0, Math.floor(progress * text.length))
}
