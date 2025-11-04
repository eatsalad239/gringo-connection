/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Server mode: Full Next.js features including API routes, SSR, and database queries
  // Cloudflare Pages supports Next.js server mode via Workers
  // Remove output: 'export' to enable server-side rendering and API routes
  images: {
    // Images are optimized by default in server mode
    formats: ['image/avif', 'image/webp'],
  },
  // i18n handled via route segments instead of next.config
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // Generate source maps for production debugging (optional)
  productionBrowserSourceMaps: false,
  // Optimize fonts
  optimizeFonts: true,
  // Cloudflare Pages: Disable cache generation to avoid 25MB file size limit
  webpack: (config, { isServer }) => {
    if (process.env.CI || process.env.CF_PAGES) {
      // Disable webpack cache in CI/Cloudflare Pages to avoid large cache files
      config.cache = false;
    }
    return config;
  },
  // Cloudflare Pages: Explicitly set output directory
  // This helps Cloudflare detect Next.js server mode
  experimental: {
    // Ensure Cloudflare can detect this as Next.js
  },
};

module.exports = nextConfig;
