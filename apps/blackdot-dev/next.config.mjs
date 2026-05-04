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

const r3fPackages = [
  '@react-three/fiber',
  '@react-three/drei',
  '@react-three/rapier',
  '@react-spring/three',
];

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  webpack(config, { isServer }) {
    if (isServer) {
      // R3F and Three.js use browser APIs — stub them out on the server bundle
      // so webpack doesn't try to SSR-analyze them (avoids unstable_act errors etc.)
      config.resolve.alias = {
        ...config.resolve.alias,
        ...Object.fromEntries(r3fPackages.map((pkg) => [pkg, false])),
      };
    }
    return config;
  },
};

export default nextConfig
