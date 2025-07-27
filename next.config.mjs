// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login', // Redirects homepage to /login
        permanent: true,
      },
    ];
  },

  eslint:{
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
