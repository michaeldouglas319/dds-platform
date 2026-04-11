import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright runs against the wiki app, which is the only app currently
 * exercised by the e2e suite. The dev server is started automatically by
 * Playwright on `WIKI_E2E_PORT` (default 3010).
 *
 * Browser binaries: in CI / locally we expect either a stock Playwright
 * install (the default chromium-headless-shell) or a sandboxed environment
 * that ships its own chromium. In the latter case set
 * `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/abs/path/to/chrome` and Playwright
 * will use it instead of downloading a fresh build.
 */
const PORT = Number(process.env.WIKI_E2E_PORT ?? 3010);
const baseURL = `http://localhost:${PORT}`;

const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'line' : 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(chromiumExecutablePath
          ? { launchOptions: { executablePath: chromiumExecutablePath } }
          : {}),
      },
    },
  ],

  webServer: {
    command: `pnpm --filter @dds/ageofabundance-wiki dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
