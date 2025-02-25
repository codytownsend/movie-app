/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['image.tmdb.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  // Enable PWA configuration
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  },
  // Optimize SVG files
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  // API redirects for TMDB API (to hide API key in client requests)
  async rewrites() {
    return [
      {
        source: '/api/tmdb/:path*',
        destination: 'https://api.themoviedb.org/3/:path*',
      },
    ];
  },
  // Internationalization - for future language support
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
}