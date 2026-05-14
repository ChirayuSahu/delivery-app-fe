import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '*',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pod.rajeshpharma.com',
        pathname: '/**',
      },
    ],
  },
};


export default nextConfig;
