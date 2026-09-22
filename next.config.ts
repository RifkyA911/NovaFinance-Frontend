import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
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
      {
        source: "/api/workspaces/:path*",
        destination: `${BACKEND_URL}/api/workspaces/:path*`,
      },
      {
        source: "/api/user/:path*",
        destination: `${BACKEND_URL}/api/user/:path*`,
      },
    ];
  },
};

export default nextConfig;
