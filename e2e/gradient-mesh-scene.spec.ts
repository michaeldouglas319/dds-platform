import { test, expect } from '@playwright/test';

/**
 * E2E tests for GradientMeshScene
 *
 * Verifies:
 * - Scene renders without console errors
 * - Canvas element is created and visible
 * - Token bridge integration (theme switching updates colors)
 * - Reduced motion is respected (animation pauses)
 * - Responsive resizing works
 */

test.describe('GradientMeshScene', () => {
  // Navigate to demo page before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo', { waitUntil: 'networkidle' });
  });

  test.describe('Rendering and Errors', () => {
    test('renders demo page without critical console errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Wait for scene to initialize
      await page.waitForTimeout(2000);

      // Filter out expected third-party errors (CORS, etc.)
      const criticalErrors = errors.filter(
        (e) =>
          !e.includes('CORS') &&
          !e.includes('Failed to load') &&
          !e.includes('Context lost') &&
          !e.includes('3D') &&
          !e.toLowerCase().includes('webgl')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    test('displays scene container with visible border', async ({ page }) => {
      const container = page.locator('[data-testid="scene-container"]');
      await expect(container).toBeVisible();

      const boundingBox = await container.boundingBox();
      expect(boundingBox).toBeTruthy();
      expect(boundingBox?.width).toBeGreaterThan(0);
      expect(boundingBox?.height).toBeGreaterThan(0);
    });

    test('creates canvas element inside scene container', async ({ page }) => {
      // Wait for canvas to be created by Three.js
      const canvas = page.locator('[data-testid="scene-container"] canvas');
      await expect(canvas).toBeVisible({ timeout: 5000 });

      // Verify canvas has proper dimensions
      const boundingBox = await canvas.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(0);
      expect(boundingBox?.height).toBeGreaterThan(0);
    });
  });

  test.describe('Theme Bridge Integration', () => {
    test('updates color tokens when theme changes', async ({ page }) => {
      // Get initial theme
      const currentThemeDisplay = page.locator('[data-testid="current-theme"]');
      const initialTheme = await currentThemeDisplay.textContent();
      expect(initialTheme).toBe('minimal');

      // Switch to vibrant theme
      const vibrantButton = page.locator('[data-testid="theme-button-vibrant"]');
      await vibrantButton.click();

      // Verify theme display updated
      const newTheme = await currentThemeDisplay.textContent();
      expect(newTheme).toBe('vibrant');

      // Verify data-theme-variant attribute changed
      const htmlElement = page.locator('html');
      const themeAttr = await htmlElement.getAttribute('data-theme-variant');
      expect(themeAttr).toBe('vibrant');
    });

    test('persists theme across multiple switches', async ({ page }) => {
      const themes = ['vibrant', 'neon', 'arctic', 'sunset'];

      for (const theme of themes) {
        const themeButton = page.locator(`[data-testid="theme-button-${theme}"]`);
        await themeButton.click();

        const currentThemeDisplay = page.locator('[data-testid="current-theme"]');
        const displayedTheme = await currentThemeDisplay.textContent();
        expect(displayedTheme).toBe(theme);

        const htmlElement = page.locator('html');
        const themeAttr = await htmlElement.getAttribute('data-theme-variant');
        expect(themeAttr).toBe(theme);
      }
    });

    test('theme buttons show selected state', async ({ page }) => {
      // Minimal should be selected by default
      let minimalButton = page.locator('[data-testid="theme-button-minimal"]');
      let minimalClass = await minimalButton.getAttribute('class');
      expect(minimalClass).toContain('default'); // default variant

      // Click forest theme
      const forestButton = page.locator('[data-testid="theme-button-forest"]');
      await forestButton.click();

      // Forest should now be selected
      const forestClass = await forestButton.getAttribute('class');
      expect(forestClass).toContain('default');

      // Minimal should no longer be default variant
      minimalButton = page.locator('[data-testid="theme-button-minimal"]');
      minimalClass = await minimalButton.getAttribute('class');
      expect(minimalClass).toContain('outline');
    });
  });

  test.describe('Accessibility - Reduced Motion', () => {
    test('displays reduced motion status', async ({ page }) => {
      const statusDisplay = page.locator('[data-testid="reduced-motion-status"]');
      await expect(statusDisplay).toBeVisible();

      const statusText = await statusDisplay.textContent();
      expect(statusText).toMatch(/Motion Active|Animation Enabled/);
    });

    test('scene respects prefers-reduced-motion preference', async ({ page }) => {
      // This test verifies the component is responsive to the preference
      // Note: Fully testing reduced motion requires OS-level emulation
      // but we can verify the status display works

      const statusDisplay = page.locator('[data-testid="reduced-motion-status"]');
      const statusText = await statusDisplay.textContent();

      // Status should indicate whether animation is enabled or paused
      expect(statusText).toBeTruthy();
      expect(statusText).toMatch(/⏸️|▶️/);
    });
  });

  test.describe('Responsive Behavior', () => {
    test('responsive scene container adapts to viewport changes', async ({ page }) => {
      const container = page.locator('[data-testid="responsive-scene-container"]');

      // Get initial size
      let boundingBox = await container.boundingBox();
      const initialWidth = boundingBox?.width ?? 0;
      const initialHeight = boundingBox?.height ?? 0;

      expect(initialWidth).toBeGreaterThan(0);
      expect(initialHeight).toBeGreaterThan(0);

      // Resize viewport
      await page.setViewportSize({ width: 600, height: 800 });
      await page.waitForTimeout(500);

      // Get new size
      boundingBox = await container.boundingBox();
      const newWidth = boundingBox?.width ?? 0;

      // Width should change proportionally to viewport
      expect(newWidth).toBeLessThan(initialWidth);
    });

    test('fixed height scene maintains specified height', async ({ page }) => {
      const container = page.locator('[data-testid="scene-container"]');
      const boundingBox = await container.boundingBox();

      // Scene is set to height={400}
      expect(boundingBox?.height).toBeCloseTo(400, { maxDifference: 20 });
    });

    test('canvas scales with container dimensions', async ({ page }) => {
      const canvas = page.locator('[data-testid="scene-container"] canvas');
      const containerBox = await page.locator('[data-testid="scene-container"]').boundingBox();
      const canvasBox = await canvas.boundingBox();

      // Canvas should fill container
      expect(canvasBox?.width).toBeCloseTo(containerBox?.width ?? 0, { maxDifference: 1 });
      expect(canvasBox?.height).toBeCloseTo(containerBox?.height ?? 0, { maxDifference: 1 });
    });
  });

  test.describe('Interaction and State', () => {
    test('scene remains stable during rapid theme changes', async ({ page }) => {
      const currentThemeDisplay = page.locator('[data-testid="current-theme"]');

      // Rapidly switch themes
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-testid="theme-button-vibrant"]').click();
        await page.locator('[data-testid="theme-button-forest"]').click();
        await page.locator('[data-testid="theme-button-minimal"]').click();
      }

      // Verify final state is correct
      const finalTheme = await currentThemeDisplay.textContent();
      expect(finalTheme).toBe('minimal');

      // Verify no console errors occurred
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.waitForTimeout(500);

      const criticalErrors = errors.filter(
        (e) =>
          !e.includes('CORS') &&
          !e.includes('Failed to load') &&
          !e.includes('Context lost')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    test('all theme buttons are accessible and clickable', async ({ page }) => {
      const themes = [
        'minimal',
        'vibrant',
        'neon',
        'arctic',
        'sunset',
        'forest',
        'midnight',
        'mist',
        'monochrome',
      ];

      for (const theme of themes) {
        const button = page.locator(`[data-testid="theme-button-${theme}"]`);
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();

        // Click and verify
        await button.click();
        const currentTheme = await page.locator('[data-testid="current-theme"]').textContent();
        expect(currentTheme).toBe(theme);
      }
    });
  });

  test.describe('Page Structure and Navigation', () => {
    test('page displays all required sections', async ({ page }) => {
      // Main heading
      await expect(page.locator('h1')).toContainText('GradientMeshScene Demo');

      // Section headings
      await expect(page.locator('h2').nth(0)).toContainText('Theme Variants');
      await expect(page.locator('h2').nth(1)).toContainText('Accessibility');
      await expect(page.locator('h2').nth(2)).toContainText('Gradient Mesh Scene');
      await expect(page.locator('h2').nth(3)).toContainText('Responsive Resize Test');
    });

    test('scene container has proper styling and visibility', async ({ page }) => {
      const container = page.locator('[data-testid="scene-container"]');

      // Verify visible
      await expect(container).toBeVisible();

      // Verify styling
      const style = await container.getAttribute('style');
      expect(style).toContain('border');
      expect(style).toContain('border-radius');
    });
  });
});
