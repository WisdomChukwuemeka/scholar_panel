// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://panel-1-tlqv.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;