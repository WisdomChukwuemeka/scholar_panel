/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'https://panel-1-tlqv.onrender.com'}/api/:path*`,
      },
    ];
  },
  // Add headers for CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.BACKEND_URL || 'https://panel-1-tlqv.onrender.com' },
        ],
      },
    ];
  },
};

export default nextConfig;