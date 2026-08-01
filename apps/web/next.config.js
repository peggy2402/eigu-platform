/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@eigu-platform/shared'],
  async rewrites() {
    return [
      { source: '/about', destination: '/' },
      { source: '/pricing', destination: '/' },
      { source: '/news', destination: '/' },
      { source: '/faq', destination: '/' },
      { source: '/contact', destination: '/' },
    ];
  },
};

module.exports = nextConfig;
