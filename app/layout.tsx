import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import SiteChrome from "@/components/layout/SiteChrome";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import ReduxProvider from "@/components/providers/redux-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

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
    default: "SnapHost - Instantly upload and share images and PDFs.",
    template: "%s | SnapHost",
  },
  icons: {
    icon: [
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  description:
    "Instantly upload and share images and PDFs with clean, fast links. No login required. Simple, secure file hosting in seconds.",
  keywords: [
    "file hosting",
    "image upload",
    "pdf sharing",
    "instant file share",
    "snap host",

  ],
  authors: [{ name: "SnapHost" }],
  creator: "SnapHost",
  metadataBase: new URL("https://snaphost.cloud"),
  openGraph: {
    title: "SnapHost.cloud",
    description:
      "Instantly upload and share images and PDFs with clean, fast links. No login required. Simple, secure file hosting in seconds.",
    url: "https://snaphost.cloud",
    siteName: "SnapHost",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapHost.cloud",
    description:
      "Instantly upload and share images and PDFs with clean, fast links. No login required. Simple, secure file hosting in seconds.",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
        <link rel="manifest" href="/manifest.json" />
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
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground flex flex-col"
      >
        <ReduxProvider>
          <AuthProvider>
            <ThemeProvider>
              <TooltipProvider>
                <Toaster position="top-right" closeButton duration={3000} />
                <SiteChrome>{children}</SiteChrome>
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
