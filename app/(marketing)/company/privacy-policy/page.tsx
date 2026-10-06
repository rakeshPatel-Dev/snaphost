import { privacyPolicySections } from '@/data/company'
import Container from '@/components/shared/Container'
import JsonLd from '@/components/shared/JsonLd'
import { breadcrumbSchema, createPageMetadata, graph, SITE_NAME, webPageSchema } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: `Privacy Policy — What Data ${SITE_NAME} Collects`,
  description: `How ${SITE_NAME} collects, uses, stores, and deletes data: uploaded files, account records, anonymous sessions, analytics, and cookies.`,
  path: '/company/privacy-policy',
  keywords: ['privacy policy', 'data privacy', 'data processing', 'gdpr', 'file upload privacy'],
})

const TRAIL = [
  { name: 'Home', path: '/' },
  { name: 'Company', path: '/company' },
  { name: 'Privacy Policy', path: '/company/privacy-policy' },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="py-20 sm:py-24">
      <JsonLd
        data={graph(
          webPageSchema({
            name: `${SITE_NAME} Privacy Policy`,
            description: `How ${SITE_NAME} collects, uses, stores, and deletes user data.`,
            path: '/company/privacy-policy',
            breadcrumbTrail: TRAIL,
          }),
          breadcrumbSchema(TRAIL)
        )}
      />
      <Container className="max-w-3xl">
        <h1 className="text-4xl font-semibold leading-[1.06] tracking-tight text-foreground sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          This policy describes the data Snaphost collects to power file uploads, user accounts,
          sharing, and the rest of the app experience.
        </p>

        <div className="mt-12 space-y-10">
          {privacyPolicySections.map((section) => (
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
