import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // @ts-ignore
    // reactCompiler: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  serverExternalPackages: ['pdf2json', 'mammoth'],
};

export default nextConfig;
