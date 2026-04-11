/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  transpilePackages: [
    '@dds/renderer',
    '@dds/types',
    '@dds/config',
    '@dds/hooks',
    '@dds/ui',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
