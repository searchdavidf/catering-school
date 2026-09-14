import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude server-only packages from client bundle
  serverExternalPackages: ['@google/generative-ai'],
  
  // Ensure output is compatible with Vercel
  output: 'standalone',
};

export default nextConfig;
