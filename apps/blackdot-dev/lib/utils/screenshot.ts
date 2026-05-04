/**
 * Screenshot Utility Functions
 *
 * Lightweight utilities for capturing screenshots of localhost routes.
 * Requires Playwright to be installed: npm install --save-dev playwright
 */

/**
 * Capture a single localhost route as PNG
 *
 * @param route - Route path (e.g., '/resume', '/ideas')
 * @param options - Screenshot options
 * @returns Path to saved screenshot or null on error
 *
 * @example
 * const filepath = await captureRoute('/resume', {
 *   port: 3000,
 *   output: './screenshots',
 *   wait: 2000,
 * });
 * console.log(`Screenshot saved to: ${filepath}`);
 */
export async function captureRoute(
  route: string,
  options?: {
    port?: number;
    output?: string;
    wait?: number;
    fullPage?: boolean;
    width?: number;
    height?: number;
  }
): Promise<string | null> {
  try {
    // Lazy load Playwright (optional dependency)
    const { chromium } = await import('playwright');
    const fs = await import('fs').then(m => m.default);
    const path = await import('path').then(m => m.default);

    const {
      port = 3000,
      output = './screenshots',
      wait = 2000,
      fullPage = true,
      width = 1280,
      height = 720,
    } = options || {};

    // Ensure output directory exists
    if (!fs.existsSync(output)) {
      fs.mkdirSync(output, { recursive: true });
    }

    const url = `http://localhost:${port}${route}`;
    const filename = (route.replace(/^\//, '').replace(/\//g, '_').replace(/\?.*$/, '') || 'index') + '.png';
    const filepath = path.join(output, filename);

    console.log(`📸 Capturing: ${url}`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width, height } });

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(wait);
      await page.screenshot({ path: filepath, fullPage });
      console.log(`✅ Saved: ${filepath}`);
      return filepath;
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error(`❌ Error capturing ${route}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Capture multiple routes as PNG files
 *
 * @param routes - Array of route paths
 * @param options - Screenshot options
 * @returns Object with success/failure results
 *
 * @example
 * const results = await captureRoutes(['/resume', '/ideas', '/business'], {
 *   port: 3000,
 *   output: './screenshots'
 * });
 * console.log(`Captured ${results.successful} routes`);
 */
export async function captureRoutes(
  routes: string[],
  options?: Parameters<typeof captureRoute>[1]
): Promise<{
  successful: number;
  failed: number;
  results: Array<{ route: string; filepath: string | null; success: boolean }>;
}> {
  const results = [];
  let successful = 0;
  let failed = 0;

  for (const route of routes) {
    const filepath = await captureRoute(route, options);
    if (filepath) {
      successful++;
      results.push({ route, filepath, success: true });
    } else {
      failed++;
      results.push({ route, filepath: null, success: false });
    }
  }

  return { successful, failed, results };
}

/**
 * Quick capture helper - returns the screenshot file path
 *
 * @param route - Route to capture
 * @param port - Port number (default: 3000)
 * @returns Path to screenshot or null on error
 *
 * @example
 * const screenshot = await screenshot('/resume');
 * // → './screenshots/resume.png'
 */
export async function screenshot(
  route: string,
  port: number = 3000
): Promise<string | null> {
  return captureRoute(route, { port });
}
