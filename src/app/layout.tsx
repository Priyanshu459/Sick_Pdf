import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

import { Providers } from "@/components/Providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4f46e5",
};

export const metadata: Metadata = {
  title: {
    default: "PDF Master | Free Online PDF Tools (Merge, Split, Convert)",
    template: "%s | PDF Master",
  },
  description: "Every tool you need to work with PDFs in one place. 100% free online PDF tools to merge, split, compress, convert, and edit PDFs. pdfmaster, pdf master.",
  keywords: ["pdfmaster", "pdf master", "Pdf maqster", "free online pdf tools", "merge pdf", "split pdf", "compress pdf", "edit pdf", "convert pdf", "pdf to word", "pdf to excel"],
  metadataBase: new URL("https://pdfmaster.rooted-feed.online"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PDF Master | Free Online PDF Tools",
    description: "Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use!",
    url: "https://pdfmaster.rooted-feed.online",
    siteName: "PDF Master",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Master | Free Online PDF Tools",
    description: "Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use!",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PDF Master",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
