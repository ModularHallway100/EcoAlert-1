/**
 * Next.js configuration for optimized bundle size and performance
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for performance
  experimental: {
    // Enable optimized image loading
    optimizeCss: true,
  },

  // Images configuration for optimization
  images: {
    // Enable modern image formats
    formats: ['image/webp', 'image/avif'],
    // Enable device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Enable image sizes for responsive images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Disable image optimization in development
    unoptimized: false,
  },

  // Compress assets
  compress: true,

  // Headers for better caching
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
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Performance optimization for production
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;