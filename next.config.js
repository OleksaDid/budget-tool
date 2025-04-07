/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Public environment variables (available in browser)
    NEXT_PUBLIC_APP_NAME: 'Budget Tool',
  },
  // Configure rewrites to handle SPA-style routing
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
      {
        source: '/',
        destination: '/',
      },
    ];
  },
};

module.exports = nextConfig; 