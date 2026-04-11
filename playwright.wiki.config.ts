/**
 * Wiki-only Playwright config.
 *
 * Kept separate from playwright.config.ts (which targets blackdot-dev) so the
 * wiki end-to-end suite can:
 *   - run against its own dev server on a dedicated port
 *   - point at the local Chromium binary (/opt/pw-browsers) when the
 *     CI/sandbox cannot download Chrome for Testing
 *   - be invoked independently via `pnpm test:e2e:wiki`
 *
 * Existing pnpm test:e2e behavior is intentionally untouched.
 */
import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.WIKI_E2E_PORT ?? 3001);
const BASE_URL = `http://localhost:${PORT}`;

// When PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is set we use that binary; otherwise
// rely on Playwright's downloaded browser.
const chromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './e2e/wiki',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    launchOptions: chromiumExecutable
      ? { executablePath: chromiumExecutable }
      : undefined,
  },

  projects: [
    {
      name: 'wiki-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `PORT=${PORT} pnpm --filter @dds/ageofabundance-wiki dev`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
