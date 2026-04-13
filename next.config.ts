import type { NextConfig } from "next";

/** Reachable from the Next.js process (Docker: host gateway, not localhost:6600). */
const internalApiOrigin = (
  process.env.INTERNAL_API_ORIGIN ?? "http://127.0.0.1:6600"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${internalApiOrigin}/api/v1/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.backblazeb2.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
