import type { NextConfig } from 'next';

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

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
