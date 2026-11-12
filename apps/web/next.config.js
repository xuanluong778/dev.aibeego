/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  transpilePackages: ['@marketingspa/shared'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    ...(process.env.LP_RELEASE_BUILD === '1' ? { cpus: 1, workerThreads: false } : {}),
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // standalone dùng khi build Docker trên Linux; tắt trên Windows dev (symlink EPERM)
  ...(process.env.DOCKER_BUILD === 'true' ? { output: 'standalone' } : {}),
  async headers() {
    return [
      {
        // HTML/pages: không cache dài — tránh HTML cũ trỏ hash CSS/JS đã xóa sau deploy (400/unstyled)
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/brand/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      {
        source: '/chatbot/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/favicon.ico', destination: '/favicon.png', permanent: false },
      // Public legal aliases for Meta / compliance URLs — do not overwrite existing pages
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/data-deletion', destination: '/facebook/data-deletion', permanent: true },
    ];
  },
  async rewrites() {
    // Local / direct Next (:3020): proxy /uploads to API. Behind nginx, /uploads is
    // preferably handled upstream — this remains a safe fallback.
    const apiInternal =
      process.env.API_INTERNAL_URL?.replace(/\/$/, '') ||
      process.env.UPLOADS_PROXY_TARGET?.replace(/\/$/, '') ||
      'http://127.0.0.1:4010';
    return [
      {
        source: '/uploads/:path*',
        destination: `${apiInternal}/uploads/:path*`,
      },
    ];
  },
};

module.exports = (phase) => {
  if (phase === 'phase-production-build') {
    require('../../scripts/assert-landing-page-builder-release.cjs').assertLandingPageBuilderSource();
    const fs = require('node:fs');
    const path = require('node:path');
    const buildId = process.env.LP_BUILDER_RELEASE_ID || `lpb-${require('node:crypto').randomUUID()}`;
    process.env.LP_BUILDER_RELEASE_ID = buildId;
    const publicDir = path.join(__dirname, 'public');
    fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(
      path.join(publicDir, 'landing-page-builder-version.json'),
      JSON.stringify({ buildId }),
    );
    nextConfig.env = { ...nextConfig.env, NEXT_PUBLIC_LP_BUILDER_VERSION: buildId };
    nextConfig.generateBuildId = async () => buildId;
  }
  return nextConfig;
};
