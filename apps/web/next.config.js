/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cloudflare Pages: Use static export for best compatibility
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  // i18n handled via route segments instead of next.config
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // Generate source maps for production debugging (optional)
  productionBrowserSourceMaps: false,
  // Optimize fonts
  optimizeFonts: true,
};

module.exports = nextConfig;

