import { termsOfServiceSections } from '@/data/company'
import Container from '@/components/shared/Container'
import JsonLd from '@/components/shared/JsonLd'
import { breadcrumbSchema, createPageMetadata, graph, SITE_NAME, webPageSchema } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: `Terms of Service — Using ${SITE_NAME}`,
  description: `The rules for using ${SITE_NAME}: acceptable use, ownership of uploaded content, link expiry, account deletion, and liability limits.`,
  path: '/company/terms-of-service',
  keywords: ['terms of service', 'user agreement', 'acceptable use', 'file sharing terms'],
})

const TRAIL = [
  { name: 'Home', path: '/' },
  { name: 'Company', path: '/company' },
  { name: 'Terms of Service', path: '/company/terms-of-service' },
]

export default function TermsOfServicePage() {
  return (
    <main className="py-20 sm:py-24">
      <JsonLd
        data={graph(
          webPageSchema({
            name: `${SITE_NAME} Terms of Service`,
            description: `The rules and responsibilities for using ${SITE_NAME}.`,
            path: '/company/terms-of-service',
            breadcrumbTrail: TRAIL,
          }),
          breadcrumbSchema(TRAIL)
        )}
      />
      <Container className="max-w-3xl">
        <h1 className="text-4xl font-semibold leading-[1.06] tracking-tight text-foreground sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          These Terms describe how Snaphost can be used, what users are responsible for, and how
          uploaded content and public links should be handled.
        </p>

        <div className="mt-12 space-y-10">
          {termsOfServiceSections.map((section) => (
            <section
              key={section.title}
              className="border-t border-border/50 pt-6 first:border-t-0 first:pt-0"
            >
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </main>
  )
}
