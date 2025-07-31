import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'foreignvasi.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
