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
  // Transpile R3F/Three packages so webpack converts their ESM to CJS,
  // avoiding strict named-export validation (e.g. React.unstable_act in R3F 8.x)
  transpilePackages: [
    '@react-three/fiber',
    '@react-three/drei',
    '@react-three/rapier',
    '@react-spring/three',
    '@react-spring/core',
  ],
};

export default nextConfig
