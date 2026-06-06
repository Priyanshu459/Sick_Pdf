import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Sick PDF Manager",
  description: "Advanced PDF management, editing, and conversion suite.",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sick PDF Manager",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
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
