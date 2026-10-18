import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // API-backed images use cache-busting query strings such as `?v=...`.
    localPatterns: [
      { pathname: "/api/collaborations/**" },
      { pathname: "/api/events/**" },
      { pathname: "/api/leadership/**" },
      { pathname: "/api/team/**" },
      { pathname: "/api/templates/**" },
    ],
  },
};

export default nextConfig;
