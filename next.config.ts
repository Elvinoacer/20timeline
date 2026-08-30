import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles Next.js server packaging itself. Keep standalone for
  // local/self-hosted builds, but disable it on Vercel to avoid the
  // Next.js 16.3 + Vercel output-file-tracing regression.
  output: process.env.VERCEL ? undefined : "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
