import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rendererPath = resolve(__dirname, '../../packages/renderer');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@dds/renderer', '@dds/config', '@dds/hooks', '@dds/ui', '@dds/types'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components': resolve(rendererPath, 'components'),
      '@/lib': resolve(rendererPath, 'lib'),
      '@dds/renderer-styles': resolve(rendererPath, 'styles/globals.css'),
    };

    // GLSL shader support for Three.js renderers
    config.module.rules.push({
      test: /\.glsl$/,
      type: 'asset/source',
    });

    return config;
  },
};

export default nextConfig;
