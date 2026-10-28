/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // API-backed images use cache-busting query strings such as `?v=...`.
    localPatterns: [
      { pathname: "/**" },
    ],
  },
};

export default nextConfig;
