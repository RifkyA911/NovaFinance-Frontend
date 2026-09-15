import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/documents/:path*",
        destination: `${BACKEND_URL}/api/documents/:path*`,
      },
      {
        source: "/documents/:path*",
        destination: `${BACKEND_URL}/documents/:path*`,
      },
    ];
  },
};

export default nextConfig;
