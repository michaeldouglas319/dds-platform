import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['packages/**/*.test.{ts,tsx}'],
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
