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
  reactStrictMode: true,
  // swcMinify é padrão no Next.js 16+ (removido para evitar warning)
  // Turbopack é usado por padrão no Next.js 16+
  // jspdf será importado dinamicamente apenas no client-side
};

module.exports = nextConfig;
