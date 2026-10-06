import { FeatureShowcase, CTA, FAQ, Hero, LogoCloud, Pricing } from '@/features/landing'
import JsonLd from '@/components/shared/JsonLd'
import { faqs } from '@/data/faq'
import { features } from '@/data/features'
import {
  breadcrumbSchema,
  createPageMetadata,
  DEFAULT_KEYWORDS,
  faqSchema,
  graph,
  MAX_FILE_SIZE_LABEL,
  SITE_NAME,
  softwareApplicationSchema,
  SUPPORTED_FORMATS,
  webPageSchema,
} from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Instant File Sharing for Images & PDFs',
  description:
    'Upload an image or PDF and get a shareable link in seconds. No account required — anonymous links auto-expire after 24 hours. Free, no signup, up to 10 MB per file.',
  path: '/',
  keywords: DEFAULT_KEYWORDS,
})

const howItWorksSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to share a file with SnapHost',
  description: `Upload a ${SUPPORTED_FORMATS.replace(', PDF', '')} or PDF up to ${MAX_FILE_SIZE_LABEL} and share the generated link.`,
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Drop or pick your file',
      text: `Choose a ${SUPPORTED_FORMATS} file up to ${MAX_FILE_SIZE_LABEL} and drop it onto the upload area.`,
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Get an instant link',
      text: 'SnapHost validates the file and returns a public link immediately — no account needed.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Share it anywhere',
      text: 'Copy the link and send it over chat, email, or docs. Anonymous links expire after 24 hours.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Manage it if you signed up',
      text: 'Signed-in users can rename files, change slugs, adjust expiry, and delete uploads from the dashboard.',
    },
  ],
}

const featureListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `${SITE_NAME} features`,
  itemListElement: features.map((feature, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'SoftwareApplication',
      name: feature.title,
      description: feature.description,
    },
  })),
}

export default function Home() {
  return (
    <main className="flex flex-col">
      <JsonLd
        data={graph(
          webPageSchema({
            name: `${SITE_NAME} — Instant File Sharing for Images & PDFs`,
            description:
              'Upload an image or PDF and get a shareable link in seconds. No account required.',
            path: '/',
          }),
          breadcrumbSchema([{ name: 'Home', path: '/' }]),
          softwareApplicationSchema(),
          howItWorksSchema,
          featureListSchema,
          faqSchema(faqs)
        )}
      />
      <Hero />
      <LogoCloud />
      <FeatureShowcase />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
  )
}
