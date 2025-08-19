import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel optimized configuration
  // Remove static export for Vercel - it supports SSR/ISR
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
