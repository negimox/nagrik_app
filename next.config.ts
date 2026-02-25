import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React StrictMode to prevent double-invocation of effects,
  // which causes Leaflet to throw "Map container is already initialized"
  // because StrictMode mounts → unmounts → remounts components in development.
  reactStrictMode: false,
  typescript: {
    // Temporarily disable TypeScript errors during build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
