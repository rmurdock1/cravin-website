import type { NextConfig } from 'next';

// Content Security Policy — scoped to the exact external origins the site loads:
//   • Google Tag Manager / Analytics (gtag.js + beacons)
//   • Google Maps embeds (location page iframes)
//   • TikTok embed (About page)
// Everything else (ezCater, UberEats, press links) is plain <a> navigation, not a subresource.
const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.tiktok.com https://*.tiktokcdn.com https://*.tiktokcdn-us.com",
  "style-src 'self' 'unsafe-inline' https://*.tiktokcdn.com https://*.tiktokcdn-us.com",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.tiktokv.com https://*.tiktokcdn.com https://*.tiktokcdn-us.com",
  "frame-src https://www.google.com https://www.tiktok.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig: NextConfig = {
  // Redirect old .html URLs to clean paths (SEO preservation)
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/menu.html', destination: '/menu', permanent: true },
      { source: '/catering.html', destination: '/catering', permanent: true },
      { source: '/order.html', destination: '/order', permanent: true },
      { source: '/locations.html', destination: '/locations', permanent: true },
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/success.html', destination: '/success', permanent: true },
    ];
  },

  // Apply security headers site-wide
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
