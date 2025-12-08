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
  transpilePackages: ['jspdf'],
  // Configuração do Turbopack (Next.js 16+)
  turbopack: {
    // Turbopack lida melhor com módulos ES, então não precisamos de fallbacks explícitos
  },
  // Configuração do Webpack (para compatibilidade quando não usando Turbopack)
  webpack: (config, { isServer }) => {
    // Configurar jspdf para funcionar no client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
