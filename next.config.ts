import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Temporarily disable TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily disable ESLint errors during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
