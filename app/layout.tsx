import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Social Text Formatter - Format Text for Social Media",
  description:
    "Transform your text with bold, italic, and strikethrough formatting for Facebook, LinkedIn, TikTok, Instagram, X, and more social platforms.",
  generator: "Social Text Formatter PWA",
  applicationName: "Social Text Formatter",
  keywords: ["text formatter", "social media", "bold text", "italic text", "unicode", "formatting"],
  authors: [{ name: "Social Text Formatter" }],
  creator: "Social Text Formatter",
  publisher: "Social Text Formatter",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://social-text-formatter.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://social-text-formatter.vercel.app",
    title: "Social Text Formatter - Format Text for Social Media",
    description:
      "Transform your text with bold, italic, and strikethrough formatting for Facebook, LinkedIn, TikTok, Instagram, X, and more social platforms.",
    siteName: "Social Text Formatter",
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Text Formatter - Format Text for Social Media",
    description:
      "Transform your text with bold, italic, and strikethrough formatting for Facebook, LinkedIn, TikTok, Instagram, X, and more social platforms.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png",
    shortcut: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Social Text Formatter",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          {children}
          <Toaster />
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
