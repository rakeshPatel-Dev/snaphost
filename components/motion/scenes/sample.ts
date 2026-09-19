import type { AnonymousLink } from '@/types/app';
import { SITE_URL } from '@/data/emails';

export const demoAnonymousLink: AnonymousLink = {
  id: 'demo-anon-link',
  filename: 'mockup.png',
  fileType: 'image',
  fileSize: '2.4 MB',
  url: `${SITE_URL}/anon/sh_7y2b1x`,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const noop = () => {};

export function reveal(text: string, t: number, start: number, end: number) {
  if (t < start) return '';
  if (t >= end) return text;
  const progress = (t - start) / (end - start);
  return text.slice(0, Math.floor(progress * text.length));
}