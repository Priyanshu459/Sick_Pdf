import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "PDF Master - Every tool you need to work with PDFs",
  description: "Merge, split, compress, convert, and edit your PDF files completely completely online in your browser.",
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
