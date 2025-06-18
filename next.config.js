/** @type {import('next').NextConfig} */
const nextConfig = {
  
  async headers() {
    return [
      {
        // Configura cache para todas as imagens
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, immutable', // Cache por 1 hora
          },
        ],
      },
      {
        // matching all API routes
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },
  images: {
    domains: ['multisorteios.dev']
  },
  reactStrictMode: false,
  swcMinify: false, 
  i18n: {
    locales: ['pt-BR'],
    defaultLocale: 'pt-BR',
    localeDetection: false,
  },
}

module.exports = nextConfig
