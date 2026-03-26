import { test, expect } from '@playwright/test';

test.describe('Blackdot Dev App', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');

    const heading = page.locator('text=Dev');
    await expect(heading).toBeVisible();
  });

  test('home page has navigation links', async ({ page }) => {
    await page.goto('/');

    const sectionsLink = page.locator('text=View All Sections');
    await expect(sectionsLink).toBeVisible();

    const demoLink = page.locator('text=Demo Page');
    await expect(demoLink).toBeVisible();
  });

  test('sections page loads and displays sections', async ({ page }) => {
    await page.goto('/sections');

    const heading = page.locator('text=All Sections');
    await expect(heading).toBeVisible();

    await page.waitForTimeout(2000);

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('demo page loads', async ({ page }) => {
    await page.goto('/demo');

    const heading = page.locator('text=Demo Page');
    await expect(heading).toBeVisible();

    const subtitle = page.locator('text=Theme variant switcher demo');
    await expect(subtitle).toBeVisible();
  });

  test('demo page lists theme variants', async ({ page }) => {
    await page.goto('/demo');

    const minimal = page.locator('text=minimal');
    await expect(minimal).toBeVisible();

    const vibrant = page.locator('text=vibrant');
    await expect(vibrant).toBeVisible();

    const neon = page.locator('text=neon');
    await expect(neon).toBeVisible();

    const midnight = page.locator('text=midnight');
    await expect(midnight).toBeVisible();
  });

  test('navigate from home to sections', async ({ page }) => {
    await page.goto('/');

    const link = page.locator('text=View All Sections');
    await link.click();

    await page.waitForURL('/sections');

    const heading = page.locator('text=All Sections');
    await expect(heading).toBeVisible();
  });

  test('navigate from home to demo', async ({ page }) => {
    await page.goto('/');

    const link = page.locator('text=Demo Page');
    await link.click();

    await page.waitForURL('/demo');

    const heading = page.locator('text=Demo Page');
    await expect(heading).toBeVisible();
  });

  test('sections page renders with proper styling', async ({ page }) => {
    await page.goto('/sections');

    await page.waitForTimeout(2000);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    const h2Elements = page.locator('h2');
    const count = await h2Elements.count();

    expect(count).toBeGreaterThan(0);
  });

  test('responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('responsive design on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/sections');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('responsive design on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('theme provider works', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const themeAttr = await html.getAttribute('data-theme');

    expect(themeAttr).toBeTruthy();
  });

  test('theme variant is set', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const variantAttr = await html.getAttribute('data-theme-variant');

    expect(variantAttr).toBeTruthy();
  });
});
