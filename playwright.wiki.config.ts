import { defineConfig, devices } from '@playwright/test';

/**
 * Dedicated Playwright config for the theageofabundance.wiki app.
 *
 * Lives alongside `playwright.config.ts` (which targets blackdot-dev) so each
 * app can be tested in isolation without booting unrelated servers. Run with:
 *
 *     pnpm exec playwright test -c playwright.wiki.config.ts
 *
 * The webServer runs the production `next start` on port 3100 to mirror the
 * Vercel build the wiki will actually ship to — dev mode hides hydration
 * regressions and SSG metadata bugs, so we lean on `next build && next start`
 * as the golden-path baseline.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /wiki\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'wiki',
      use: {
        ...devices['Desktop Chrome'],
        // Honor a preinstalled chromium when PLAYWRIGHT_CHROMIUM_EXECUTABLE is
        // set in the environment (sandboxed / CI hosts often ship one already,
        // so we avoid a network download on `playwright install`).
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
          : undefined,
      },
    },
  ],
  webServer: {
    command: 'cd apps/theageofabundance-wiki && pnpm build && PORT=3100 pnpm start',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 240 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
