import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthWrapper } from "@/components/providers/google-auth-provider";

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
    default: "RuralSync - Local Home Services Marketplace",
    template: "%s | RuralSync",
  },
  description:
    "Find and book trusted local home services in your city. Plumbing, electrical, cleaning, and more. Compare prices, read reviews, and book online.",
  keywords: [
    "RuralSync",
    "home services",
    "local services",
    "plumbing",
    "electrical",
    "cleaning",
    "gardening",
    "home repair",
    "service marketplace",
    "book services online",
  ],
  authors: [{ name: "RuralSync" }],
  creator: "RuralSync",
  publisher: "RuralSync",
  metadataBase: new URL("https://ruralsync.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ruralsync.vercel.app",
    siteName: "RuralSync",
    title: "RuralSync - Local Home Services Marketplace",
    description:
      "Find and book trusted local home services. Compare prices, read reviews, and book online.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RuralSync - Local Home Services Marketplace",
    description:
      "Find and book trusted local home services. Compare prices, read reviews, and book online.",
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
  verification: {
    // Add your verification codes here
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleOAuthWrapper>
          {children}
        </GoogleOAuthWrapper>
        <Toaster />
      </body>

    </html>
  );
}
