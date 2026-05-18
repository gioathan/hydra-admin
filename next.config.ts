import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow external photo URLs from Google Places and any other sources
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
