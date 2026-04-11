/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // The wiki renderer plugin imports @dds/renderer / @dds/types as raw TS
  // sources from the workspace. Next must transpile them.
  transpilePackages: ['@dds/renderer', '@dds/types', '@dds/ui'],
};

export default nextConfig;
