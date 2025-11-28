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
  // Prevent middleware from running on rewrites
  skipMiddlewareUrlNormalize: true,
};

export default nextConfig;