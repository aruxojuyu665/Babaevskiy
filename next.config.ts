import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    qualities: [75, 85],
  },
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
