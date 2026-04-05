/** @type {import('next').NextConfig} */
const nextConfig = {
  // All domains are served through this single app.
  // Vercel routes them here via custom domain assignments on the hub project.
  // No rewrites needed — host-based rendering is handled in app/page.tsx.

  transpilePackages: ['@measured/puck'],
};

export default nextConfig;
