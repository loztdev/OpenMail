/** @type {import('next').NextConfig} */
const isMobileBuild = process.env.MOBILE_BUILD === 'true';

const nextConfig = {
  // Static export for Capacitor (mobile). API routes are excluded; the app
  // calls AI providers directly via the native HTTP plugin instead.
  ...(isMobileBuild && {
    output: 'export',
    distDir: 'out',
    trailingSlash: true,
  }),
  images: {
    // Static export requires unoptimized images
    unoptimized: isMobileBuild,
    remotePatterns: [
      { protocol: 'https', hostname: 'openrouter.ai' },
    ],
  },
};

export default nextConfig;
