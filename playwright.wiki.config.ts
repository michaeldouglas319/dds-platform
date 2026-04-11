import { defineConfig, devices } from '@playwright/test';

/**
 * Dedicated Playwright configuration for the `@dds/ageofabundance-wiki` app.
 *
 * Kept separate from `playwright.config.ts` so the existing `blackdot-dev`
 * suite stays untouched and the two apps can run independently on
 * different ports. Invoke with `pnpm test:e2e:wiki`.
 */
export default defineConfig({
  testDir: './e2e-wiki',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm --filter @dds/ageofabundance-wiki exec next dev --port 3100 --hostname 127.0.0.1',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
