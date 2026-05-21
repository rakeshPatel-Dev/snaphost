import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";

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
      <body
        suppressHydrationWarning
        className="min-h-screen bg-white text-zinc-900 flex flex-col"
      >
        {children}
      </body>
    </html>
  );
}
