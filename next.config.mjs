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
};

export default nextConfig;
