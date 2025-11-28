/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removido output: 'export' para permitir API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
