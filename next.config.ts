import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ["cdn.sanity.io", "images.unsplash.com", "dt-fitfinity.myshopify.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "dt-fitfinity.myshopify.com",
      },
    ],
  },
};

export default nextConfig;
