import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfjs-dist'],
  webpack: (config, { dev }) => {
    if (dev) {
      // Fixes "TypeError: Object.defineProperty called on non-object" with pdfjs-dist
      config.devtool = 'cheap-module-source-map';
    }
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default withPWA(nextConfig);
