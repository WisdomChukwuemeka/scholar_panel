/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: './' // relative path to your project root
  },
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;