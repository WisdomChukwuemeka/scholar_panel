/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: './' // relative path to your project root
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BASE_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;