/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Server mode: Full Next.js features including API routes, SSR, and database queries
  // Cloudflare Pages supports Next.js server mode via Workers
  // Remove output: 'export' to enable server-side rendering and API routes
  images: {
    // Images are optimized by default in server mode
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // i18n handled via route segments instead of next.config
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // Generate source maps for production debugging (optional)
  productionBrowserSourceMaps: false,
  // Optimize fonts
  optimizeFonts: true,
  // Experimental features for better performance
  experimental: {
    // Improve scrolling performance
    scrollRestoration: true,
  },
  // Cloudflare Pages: Disable cache generation to avoid 25MB file size limit
  webpack: (config, { isServer }) => {
    if (process.env.CI || process.env.CF_PAGES) {
      // Disable webpack cache in CI/Cloudflare Pages to avoid large cache files
      config.cache = false;
    }
    return config;
  },
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
