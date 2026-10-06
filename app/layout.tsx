import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from 'sonner'
import { SiteChrome } from '@/features/layout'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import ReduxProvider from '@/components/providers/redux-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MotionConfig } from 'framer-motion'
import { Analytics } from '@vercel/analytics/next'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import JsonLd from '@/components/shared/JsonLd'
import { SITE_URL } from '@/data/emails'
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_TITLE,
  graph,
  OG_IMAGE_ALT,
  OG_IMAGE_PATH,
  OG_IMAGE_SIZE,
  organizationSchema,
  SITE_LOCALE,
  SITE_NAME,
  websiteSchema,
} from '@/lib/seo'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: 'Next.js',
  keywords: DEFAULT_KEYWORDS,
  category: 'technology',
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  referrer: 'origin-when-cross-origin',
  formatDetection: { telephone: false, address: false, email: false },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon1.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: 'default',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: absoluteUrl(OG_IMAGE_PATH),
        width: OG_IMAGE_SIZE.width,
        height: OG_IMAGE_SIZE.height,
        alt: OG_IMAGE_ALT,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: absoluteUrl(OG_IMAGE_PATH),
        alt: OG_IMAGE_ALT,
        width: OG_IMAGE_SIZE.width,
        height: OG_IMAGE_SIZE.height,
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="theme-bootstrap"
          nonce={nonce}
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = theme ? theme === 'dark' : prefersDark;
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />

        {umamiWebsiteId ? (
          <Script
            id="umami-analytics"
            src="https://cloud.umami.is/script.js"
            data-website-id={umamiWebsiteId}
            nonce={nonce}
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground flex flex-col"
      >
        <JsonLd id="ld-json-site" data={graph(organizationSchema(), websiteSchema())} />
        <ReduxProvider>
          <AuthProvider>
            <PostHogProvider>
              <ThemeProvider>
                <TooltipProvider>
                  <MotionConfig reducedMotion="user">
                    <Toaster position="top-right" closeButton duration={3000} />
                    <SiteChrome>{children}</SiteChrome>
                  </MotionConfig>
                </TooltipProvider>
              </ThemeProvider>
            </PostHogProvider>
          </AuthProvider>
        </ReduxProvider>
        <Analytics />
      </body>
    </html>
  )
}
