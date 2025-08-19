import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for platforms like Netlify/GitHub Pages
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
