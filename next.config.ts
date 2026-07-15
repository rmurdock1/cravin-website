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
  "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.tiktokv.com https://*.tiktokcdn.com https://*.tiktokcdn-us.com https://xegvxlvjqoxcpgjtjlvu.supabase.co wss://xegvxlvjqoxcpgjtjlvu.supabase.co",
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
  // 301 redirects for SEO preservation
  async redirects() {
    return [
      // Old .html URLs → clean paths
      { source: '/index.html', destination: '/', statusCode: 301 },
      { source: '/menu.html', destination: '/menu', statusCode: 301 },
      { source: '/catering.html', destination: '/catering', statusCode: 301 },
      { source: '/order.html', destination: '/order', statusCode: 301 },
      { source: '/locations.html', destination: '/locations', statusCode: 301 },
      { source: '/about.html', destination: '/about', statusCode: 301 },
      { source: '/contact.html', destination: '/contact', statusCode: 301 },
      { source: '/success.html', destination: '/success', statusCode: 301 },

      // Legacy Squarespace slugs → new routes (preserve SEO equity post-migration)
      { source: '/home', destination: '/', statusCode: 301 },
      { source: '/about-us', destination: '/about', statusCode: 301 },
      { source: '/contact-us', destination: '/contact', statusCode: 301 },
      { source: '/order-online', destination: '/order', statusCode: 301 },
      { source: '/menu-2', destination: '/menu', statusCode: 301 },
      { source: '/ossining', destination: '/locations#ossining', statusCode: 301 },
      { source: '/white-plains', destination: '/locations#white-plains', statusCode: 301 },
      { source: '/mount-vernon', destination: '/locations#mount-vernon', statusCode: 301 },
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
