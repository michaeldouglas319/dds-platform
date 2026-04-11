import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  esbuild: {
    // Use the automatic JSX runtime so test files do not need to import React
    // explicitly. App tsconfigs default to `jsx: preserve` for Next.js, which
    // would otherwise leave JSX untransformed in vitest.
    jsx: 'automatic',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'packages/**/*.test.{ts,tsx}',
      'apps/**/__tests__/**/*.test.{ts,tsx}',
    ],
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@dds/types': path.resolve(__dirname, 'packages/types'),
      '@dds/ui': path.resolve(__dirname, 'packages/ui'),
      '@dds/renderer': path.resolve(__dirname, 'packages/renderer'),
      '@dds/ai': path.resolve(__dirname, 'packages/ai'),
    },
  },
});
