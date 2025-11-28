/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: './' // relative path to your project root
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'https://panel-1-tlqv.onrender.com'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;