/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações otimizadas para Next.js 16
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { 
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Otimizações de performance
  compress: true,
  poweredByHeader: false,
  // Configurações de build otimizadas
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
