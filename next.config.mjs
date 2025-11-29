/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'https://panel-1-tlqv.onrender.com'}/api/:path*`,
      },
    ];
  },
  skipMiddlewareUrlNormalize: true,
};

export default nextConfig;