/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],

  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Previne clickjacking - impede que o site seja carregado em iframes
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Previne MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Ativa proteção XSS do navegador
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Controla informações enviadas no header Referer
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Previne uso de recursos não seguros
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Força HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Controla features do navegador
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' https://*.supabase.co https://*.pexels.com https://player.vimeo.com https://*.vimeocdn.com https://*.images.unsplash.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-src https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Desabilita o header X-Powered-By para não expor tecnologia
  poweredByHeader: false,

  // Configuração de imagens segura
  images: {
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vfujqqdxgcuubiaqcvtm.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'videos.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
