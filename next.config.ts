import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["gsap"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
};

export default nextConfig;
