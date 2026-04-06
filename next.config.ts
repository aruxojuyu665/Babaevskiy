import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === "development",
  },
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
