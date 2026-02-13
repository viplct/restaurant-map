import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    // Disable optimization for localhost development to avoid SSRF protection
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      { protocol: 'https', hostname: '**' },
    ],
    dangerouslyAllowSVG: true,
  },
}

export default nextConfig
