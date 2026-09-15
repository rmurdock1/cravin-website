import type { NextConfig } from 'next';

// Content Security Policy — scoped to the exact external origins the site loads:
//   • Google Tag Manager / Analytics (gtag.js + beacons)
//   • Google Maps embeds (location page iframes)
//   • TikTok embed (About page)
// Everything else (ezCater, UberEats, press links) is plain <a> navigation, not a subresource.
//
// `next dev` needs eval for hot reloading and serves plain http://localhost, so
// development adds 'unsafe-eval' and skips upgrade-insecure-requests. Production
// builds never get either relaxation.
const isDev = process.env.NODE_ENV === 'development';

const ContentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com https://www.tiktok.com https://*.tiktokcdn.com https://*.tiktokcdn-us.com`,
  "style-src 'self' 'unsafe-inline' https://*.tiktokcdn.com https://*.tiktokcdn-us.com",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.tiktokv.com https://*.tiktokcdn.com https://*.tiktokcdn-us.com https://xegvxlvjqoxcpgjtjlvu.supabase.co wss://xegvxlvjqoxcpgjtjlvu.supabase.co",
  "frame-src https://www.google.com https://www.tiktok.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
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
      // Canonical host: force every *.netlify.app host (bare subdomain + per-deploy
      // permalinks) to www.cravinjc.com. Prevents auth sessions landing on the wrong
      // host and stops search engines indexing the netlify.app duplicate.
      // Pull-request deploy previews (deploy-preview-N--cravinjc.netlify.app) are
      // exempt so changes can be reviewed before merging. Netlify serves them with
      // X-Robots-Tag: noindex, and sign-in no longer relies on this redirect (the
      // auth callback always returns to brand.domain).
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(?!deploy-preview-).*\\.netlify\\.app' }],
        destination: 'https://www.cravinjc.com/:path*',
        statusCode: 301,
      },

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
      // NOTE: /ossining, /white-plains and /mount-vernon are now REAL pages
      // again (restored per-location landing pages), so their old redirects to
      // /locations#<id> were removed — a redirect here would shadow the page.

      // Retired cart route (the catering order cart is now inline on /catering).
      // Was returning 404 — Search Console's single "Not found (404)". Send its
      // residual equity to the catering page.
      { source: '/cart', destination: '/catering', statusCode: 301 },
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
