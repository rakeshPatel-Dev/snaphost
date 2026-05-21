import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import {
  ClerkProvider,
  Show,
  UserButton,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";

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
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon1.png" />
        <link rel="icon" type="image/svg+xml" href="/icon0.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-white text-zinc-900 flex flex-col"
      >
        <ClerkProvider>
          <header className="p-4 border-b">
            <nav className="flex gap-2 items-center">
              <Show when="signed-out">
                <SignInButton />
                <SignUpButton />
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </nav>
          </header>

          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
