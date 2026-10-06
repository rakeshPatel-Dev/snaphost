import Link from 'next/link'
import { ArrowRight, Scale, ShieldCheck } from 'lucide-react'
import { companyOverviewLinks } from '@/data/company'
import Container from '@/components/shared/Container'
import SectionHeading from '@/components/shared/SectionHeading'
import Reveal from '@/components/motion/Reveal'
import JsonLd from '@/components/shared/JsonLd'
import {
  breadcrumbSchema,
  createPageMetadata,
  graph,
  LEGAL_PAGE_KEYWORDS,
  SITE_NAME,
  webPageSchema,
} from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Legal, Privacy & Terms',
  description: `Read the ${SITE_NAME} privacy policy and terms of service. Learn what data we collect, how uploads are handled, and the rules for using the platform.`,
  path: '/company',
  keywords: LEGAL_PAGE_KEYWORDS,
})

const TRAIL = [
  { name: 'Home', path: '/' },
  { name: 'Company', path: '/company' },
]

const iconMap = {
  'Terms of Service': Scale,
  'Privacy Policy': ShieldCheck,
}

export default function CompanyPage() {
  return (
    <main className="py-20 sm:py-24">
      <JsonLd
        data={graph(
          webPageSchema({
            name: `${SITE_NAME} — Company`,
            description: 'Legal and policy information for SnapHost.',
            path: '/company',
            breadcrumbTrail: TRAIL,
          }),
          breadcrumbSchema([
            ...TRAIL,
            ...companyOverviewLinks.map((card) => ({ name: card.title, path: card.href })),
          ])
        )}
      />
      <Container>
        <SectionHeading
          title="Legal and policy information"
          description="These pages explain how Snaphost works, what data we handle, and what users can and cannot do on the platform."
        />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {companyOverviewLinks.map((card) => {
            const Icon = iconMap[card.title as keyof typeof iconMap]

            return (
              <Reveal key={card.title} delay={0.05}>
                <Link
                  href={card.href}
                  className="group flex flex-col rounded-4xl border border-border/60 bg-card/80 p-6 backdrop-blur-xl transition-colors hover:bg-card sm:p-7"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent">
                    Read more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </main>
  )
}
