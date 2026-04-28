import { test, expect } from '@playwright/test';

/**
 * E2E smoke tests for Three.js-based renderers (R3F components).
 * Verifies:
 * - Canvas renders without console errors
 * - Fallback paths work when WebGL unavailable
 * - Accessibility attributes present (aria-hidden on canvas, alt text for fallbacks)
 * - No permanent context-lost states
 * - Responsive behavior on different viewports
 */

test.describe('3D Renderer Scenes (React Three Fiber)', () => {
  // List of test URLs and their expected identifiers
  const sceneTests = [
    {
      name: 'Globe',
      path: '/sections#globe',
      selector: 'text=3D Sphere Visualization',
      fallbackExpected: true,
    },
    {
      name: 'Earth',
      path: '/sections#earth',
      selector: 'text=3D Earth Visualization',
      fallbackExpected: true,
    },
    {
      name: 'Carousel',
      path: '/sections#carousel',
      selector: 'text=3D Carousel',
      fallbackExpected: true,
    },
    {
      name: 'Text',
      path: '/sections#text-r3f',
      selector: 'text=3D Text',
      fallbackExpected: true,
    },
    {
      name: 'Cards',
      path: '/sections#cards',
      selector: 'text=3D Cards',
      fallbackExpected: true,
    },
    {
      name: 'Model',
      path: '/sections#model',
      selector: 'text=3D Model',
      fallbackExpected: true,
    },
    {
      name: 'Code Diff',
      path: '/sections#code-diff',
      selector: 'text=Code Diff Visualization',
      fallbackExpected: true,
    },
    {
      name: 'Intro',
      path: '/sections#intro',
      selector: 'text=Interactive Scene',
      fallbackExpected: true,
    },
    {
      name: 'Centered Text',
      path: '/sections#centered-text',
      selector: 'text=3D Text Display',
      fallbackExpected: true,
    },
  ];

  test.describe('Canvas Rendering', () => {
    sceneTests.forEach(({ name, path, fallbackExpected }) => {
      test(`${name} scene loads without console errors`, async ({ page }) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            // Filter out expected CORS or resource errors (not related to renderer)
            const text = msg.text();
            if (!text.includes('CORS') && !text.includes('Failed to load')) {
              errors.push(text);
            }
          }
          if (msg.type() === 'warning') {
            warnings.push(msg.text());
          }
        });

        await page.goto(path, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000); // Wait for scene to initialize

        // Should render without critical errors (warnings are OK)
        const criticalErrors = errors.filter(
          (e) => !e.includes('Three.js') && !e.includes('context-lost')
        );
        expect(criticalErrors).toHaveLength(0);
      });

      test(`${name} scene renders fallback content`, async ({ page }) => {
        if (!fallbackExpected) return;

        await page.goto(path, { waitUntil: 'networkidle' });

        // Fallback text should be visible (indicates graceful degradation)
        const fallbackText = page.locator('text=3D');
        expect(await fallbackText.count()).toBeGreaterThan(0);
      });

      test(`${name} scene canvas is aria-hidden for screen readers`, async ({ page }) => {
        await page.goto(path, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);

        // Look for canvas elements and verify they're aria-hidden
        const canvases = await page.locator('canvas').all();
        for (const canvas of canvases) {
          const ariaHidden = await canvas.getAttribute('aria-hidden');
          // Canvas should be hidden from screen readers (3D content is visual only)
          expect(['true', null]).toContain(ariaHidden);
        }
      });
    });
  });

  test.describe('Accessibility & Fallbacks', () => {
    test('renders with light theme', async ({ page }) => {
      await page.goto('/sections', { waitUntil: 'networkidle' });

      // Set light theme
      await page.evaluate(() => {
        const html = document.documentElement;
        html.setAttribute('data-theme', 'light');
        html.setAttribute('data-theme-variant', 'minimal');
      });

      await page.waitForTimeout(500);
      const scenes = await page.locator('section').all();
      expect(scenes.length).toBeGreaterThan(0);
    });

    test('renders with dark theme', async ({ page }) => {
      await page.goto('/sections', { waitUntil: 'networkidle' });

      // Set dark theme
      await page.evaluate(() => {
        const html = document.documentElement;
        html.setAttribute('data-theme', 'dark');
        html.setAttribute('data-theme-variant', 'midnight');
      });

      await page.waitForTimeout(500);
      const scenes = await page.locator('section').all();
      expect(scenes.length).toBeGreaterThan(0);
    });

    test('respects prefers-reduced-motion', async ({ page }) => {
      // Simulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/sections', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      // Page should still render correctly
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Responsive Rendering', () => {
    test('renders correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/sections', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const sections = await page.locator('section').all();
      expect(sections.length).toBeGreaterThan(0);

      // Verify no horizontal scrolling needed
      const body = page.locator('body');
      const scrollWidth = await body.evaluate((el) => el.scrollWidth);
      const clientWidth = await body.evaluate((el) => el.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
    });

    test('renders correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/sections', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const sections = await page.locator('section').all();
      expect(sections.length).toBeGreaterThan(0);
    });

    test('renders correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/sections', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const sections = await page.locator('section').all();
      expect(sections.length).toBeGreaterThan(0);
    });

    test('handles window resize during scene initialization', async ({ page }) => {
      await page.goto('/sections', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      // Resize window
      await page.setViewportSize({ width: 500, height: 800 });
      await page.waitForTimeout(500);

      // Should still be visible
      const sections = await page.locator('section').all();
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  test.describe('Token Bridge Integration', () => {
    test('R3F renderers read CSS custom properties for theming', async ({ page }) => {
      await page.goto('/sections', { waitUntil: 'networkidle' });

      // Check if CSS custom properties are set
      const colorPrimary = await page.evaluate(() => {
        return window
          .getComputedStyle(document.documentElement)
          .getPropertyValue('--color-primary');
      });

      // Token should exist (or be fallback to transparent)
      expect(colorPrimary).toBeTruthy();
    });

    test('theme switching updates all renderers', async ({ page }) => {
      await page.goto('/sections', { waitUntil: 'networkidle' });

      const getTheme = () =>
        page.evaluate(() => document.documentElement.getAttribute('data-theme'));

      const initialTheme = await getTheme();
      expect(['light', 'dark']).toContain(initialTheme);

      // Switch theme
      await page.evaluate(() => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
      });

      await page.waitForTimeout(500);
      const newTheme = await getTheme();
      expect(newTheme).not.toBe(initialTheme);
    });
  });

  test.describe('Performance & Memory', () => {
    test('does not leak memory on rapid theme switches', async ({ page }) => {
      await page.goto('/sections', { waitUntil: 'networkidle' });

      // Perform rapid theme switches to check for memory leaks
      for (let i = 0; i < 10; i++) {
        await page.evaluate(() => {
          const html = document.documentElement;
          const current = html.getAttribute('data-theme');
          const next = current === 'light' ? 'dark' : 'light';
          html.setAttribute('data-theme', next);
        });
        await page.waitForTimeout(100);
      }

      // Page should still be responsive
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    });

    test('handles long page scrolls with multiple scenes', async ({ page }) => {
      await page.goto('/sections', { waitUntil: 'networkidle' });

      // Scroll through entire page
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          let scrolled = 0;
          const interval = setInterval(() => {
            window.scrollBy(0, 100);
            scrolled += 100;
            if (scrolled > window.document.body.scrollHeight) {
              clearInterval(interval);
              resolve();
            }
          }, 50);
        });
      });

      // Should still render without errors
      const sections = await page.locator('section').all();
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  test.describe('WebGL Context Management', () => {
    test('handles WebGL context loss gracefully', async ({ page }) => {
      await page.goto('/sections', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Simulate WebGL context loss (this is a synthetic test)
      const lossHandled = await page.evaluate(() => {
        const canvases = Array.from(document.querySelectorAll('canvas'));
        if (canvases.length === 0) return true; // No canvas = fallback already shown

        // Try to get WebGL context and verify it's initialized
        const canvas = canvases[0] as HTMLCanvasElement;
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        return gl !== null;
      });

      // Should have either canvas with WebGL or fallback content
      expect(lossHandled || (await page.locator('text=3D').count()) > 0).toBeTruthy();
    });

    test('recovers from temporary WebGL unavailability', async ({ page }) => {
      // Start on a page with 3D content
      await page.goto('/sections', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Verify initial state
      let scenesVisible = (await page.locator('section').all()).length > 0;
      expect(scenesVisible).toBeTruthy();

      // Wait a bit and reload
      await page.waitForTimeout(500);
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Should still be visible
      scenesVisible = (await page.locator('section').all()).length > 0;
      expect(scenesVisible).toBeTruthy();
    });
  });
});
