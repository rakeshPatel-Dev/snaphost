import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SiteChrome } from "@/features/layout";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import ReduxProvider from "@/components/providers/redux-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MotionConfig } from "framer-motion";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/data/emails";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Snaphost — Instant file sharing",
    template: "%s | Snaphost",
  },
  icons: {
    icon: [
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
  },
  description:
    "Upload images and PDFs and get a clean, shareable link in seconds. No account needed, and links expire automatically.",
  keywords: [
    "file hosting",
    "image upload",
    "pdf sharing",
    "instant file share",
    "anonymous file upload",
  ],
  authors: [{ name: "Snaphost" }],
  creator: "Snaphost",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Snaphost — Instant file sharing",
    description:
      "Upload images and PDFs and get a clean, shareable link in seconds. No account needed, and links expire automatically.",
    url: SITE_URL,
    siteName: "Snaphost",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Snaphost — Instant file sharing",
    description:
      "Upload images and PDFs and get a clean, shareable link in seconds. No account needed, and links expire automatically.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="Snaphost" />
        <meta name="application-name" content="Snaphost" />
        <script
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

        <script defer src="https://cloud.umami.is/script.js" data-website-id="af559c44-6fb8-4b85-b777-1b831e1655de"></script>
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground flex flex-col"
      >
        <ReduxProvider>
          <AuthProvider>
            <ThemeProvider>
              <TooltipProvider>
                <MotionConfig reducedMotion="user">
                  <Toaster position="top-right" closeButton duration={3000} />
                  <SiteChrome>{children}</SiteChrome>
                </MotionConfig>
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </ReduxProvider>
        <Analytics />
      </body>
    </html>
  );
}
