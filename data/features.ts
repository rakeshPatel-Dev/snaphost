import type { MotionSceneId } from '@/components/motion'

type FeatureRow = {
  id: MotionSceneId
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  requiresAccount?: boolean
}

export const features: FeatureRow[] = [
  {
    id: 'instant-share',
    eyebrow: '01',
    title: 'Instant sharing',
    description:
      'Upload an image or PDF and get a public link in seconds. No complicated setup, no folder management.',
    bullets: ['Upload → link → share', 'Works for images and PDFs', 'Link is live immediately'],
  },
  {
    id: 'no-account',
    eyebrow: '02',
    title: 'No account required',
    description:
      'Upload and share without an account — anonymous links auto-expire after 24 hours, so nothing lingers.',
    bullets: [
      'Anonymous uploads',
      'No signup, no password',
      'Auto-destruct after 24h',
      'Perfect for one-off shares',
    ],
  },
  {
    id: 'custom-links',
    eyebrow: '03',
    title: 'Custom links',
    description:
      'Registered users can make their links memorable — short, branded paths instead of random hashes.',
    bullets: ['Your username path', 'Pick your slug', 'Clean, readable URLs'],
    requiresAccount: true,
  },
  {
    id: 'flexible-expiry',
    eyebrow: '04',
    title: 'Flexible expiration',
    description:
      'Authenticated users choose exactly how long their files stay available — from a day to forever.',
    bullets: [
      '1 day · 7 days · 30 days · Never',
      'Per-link control',
      'Default is always 24h for anonymous',
    ],
    requiresAccount: true,
  },
  {
    id: 'file-management',
    eyebrow: '05',
    title: 'File management',
    description:
      'A simple dashboard to view, manage, copy, and delete your active links — all in one place.',
    bullets: ['View all active links', 'Copy any link instantly', 'Rename or delete anytime'],
    requiresAccount: true,
  },
]
