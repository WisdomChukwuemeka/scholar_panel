/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: './' // relative path to your project root
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;