/** @type {import('next').NextConfig} */

/**
 * Routes registry is automatically regenerated via npm lifecycle hooks:
 * - `prebuild`: Runs before `npm run build`
 * - `predev`: Runs before `npm run dev`
 * 
 * This ensures routes registry is always up-to-date with:
 * - Current route access configuration
 * - Latest route discovery
 * - Centralized access control
 */

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  webpack(config) {
    // R3F 8.x pre-built ESM dist files use `import { unstable_act } from 'react'`
    // which fails webpack 5 strict named-export validation (unstable_act is only
    // in React's CJS build, not the ESM exports map).
    // Marking as javascript/auto treats the files as CommonJS, bypassing ESM validation.
    config.module.rules.push({
      test: /node_modules\/@react-three\/(fiber|drei|rapier)/,
      type: 'javascript/auto',
    });
    return config;
  },
};

export default nextConfig
