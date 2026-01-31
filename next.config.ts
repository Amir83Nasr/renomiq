import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Use static export for Tauri builds, normal mode for development
  output: process.env.STATIC_EXPORT === 'true' ? 'export' : undefined,
  distDir: process.env.STATIC_EXPORT === 'true' ? 'out' : '.next',
  // Allow Tauri to communicate with the dev server
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
