/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // For Cloudflare Pages compatibility
  // i18n handled via route segments instead of next.config
};

module.exports = nextConfig;

