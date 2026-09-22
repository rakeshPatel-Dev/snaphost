export type FeatureValue = string | boolean

export interface Feature {
  label: string
  free: FeatureValue
  starter: FeatureValue
  pro: FeatureValue
}

export const features: Feature[] = [
  {
    label: 'File uploads',
    free: 'PNG, JPG, WEBP, PDF',
    starter: 'PNG, JPG, WEBP, PDF',
    pro: 'PNG, JPG, WEBP, PDF',
  },
  { label: 'Max file size', free: '10 MB', starter: '10 MB', pro: '10 MB' },
  { label: 'Active links', free: '3', starter: '5', pro: 'Unlimited' },
  { label: 'Anonymous upload', free: true, starter: true, pro: true },
  {
    label: 'Link expiration',
    free: '24 hours (auto)',
    starter: 'User-controlled',
    pro: 'User-controlled',
  },
  { label: 'Custom URL path', free: false, starter: true, pro: true },
  { label: 'File management dashboard', free: false, starter: true, pro: true },
  { label: 'Delete uploads', free: true, starter: true, pro: true },
  { label: 'Custom expiry rules', free: false, starter: true, pro: true },
  { label: 'Password-protected links', free: false, starter: false, pro: 'Coming soon' },
  { label: 'Custom domain', free: false, starter: false, pro: 'Coming soon' },
  { label: 'Upload analytics', free: false, starter: false, pro: 'Coming soon' },
  { label: 'Priority support', free: false, starter: false, pro: true },
]

export type PlanKey = 'free' | 'starter' | 'pro'

export const planColumns: { key: PlanKey; name: string; highlight: boolean }[] = [
  { key: 'free', name: 'Anonymous', highlight: false },
  { key: 'starter', name: 'Starter', highlight: true },
  { key: 'pro', name: 'Pro', highlight: false },
]
