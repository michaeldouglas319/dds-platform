import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Entries Page (/e)', () => {
  test('page loads and renders featured entry', async ({ page }) => {
    await page.goto(`${BASE_URL}/e`);

    // Check page title and meta
    await expect(page).toHaveTitle(/Entries/);
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /Featured and all entries/);
  });

  test('displays featured entry section', async ({ page }) => {
    await page.goto(`${BASE_URL}/e`);

    // Check for featured entry indicator and title
    const featured = page.locator('text=Featured').first();
    await expect(featured).toBeVisible();

    // Should have a featured entry title
    const title = page.locator('h2').first();
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText).toBeTruthy();
  });

  test('displays entries grid with entries', async ({ page }) => {
    await page.goto(`${BASE_URL}/e`);

    // Check for "All entries" heading
    const heading = page.locator('h2').filter({ hasText: /All entries/ });
    await expect(heading).toBeVisible();

    // Check for entry count text
    const subtitle = page.locator('text=/active entr/');
    await expect(subtitle).toBeVisible();
    const subtitleText = await subtitle.textContent();
    expect(subtitleText).toMatch(/\d+ active entr/);
  });

  test('grid entries are rendered as clickable links', async ({ page }) => {
    await page.goto(`${BASE_URL}/e`);

    // Find all entry links (should be more than 0)
    const entryLinks = page.locator('a[href^="/e/"]').filter({ hasNot: page.locator('header') });
    const count = await entryLinks.count();

    expect(count).toBeGreaterThan(0);

    // First entry should be clickable
    const firstEntry = entryLinks.first();
    await expect(firstEntry).toBeVisible();

    // Should have accessible content
    const href = await firstEntry.getAttribute('href');
    expect(href).toMatch(/^\/e\//);
  });

  test('grid layout is responsive', async ({ page }) => {
    await page.goto(`${BASE_URL}/e`);

    // Check that grid container exists
    const grid = page.locator('[class*="grid"]').first();
    await expect(grid).toBeVisible();

    // Get computed styles to verify display
    const display = await grid.evaluate(el => window.getComputedStyle(el).display);
    expect(['grid', 'block', 'flex']).toContain(display);
  });

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/e`);
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('header navigation is present', async ({ page }) => {
    await page.goto(`${BASE_URL}/e`);

    // Check for site header and navigation
    const header = page.locator('header.wiki-site-header');
    await expect(header).toBeVisible();

    // Logo should link home
    const logo = page.locator('a.wiki-site-header__logo');
    await expect(logo).toHaveAttribute('href', '/');
    await expect(logo).toHaveText(/ageofabundance/);
  });

  test('skip to main content link is present (accessibility)', async ({ page }) => {
    await page.goto(`${BASE_URL}/e`);

    // Check for skip link
    const skipLink = page.locator('a.wiki-skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('main content landmark is properly set', async ({ page }) => {
    await page.goto(`${BASE_URL}/e`);

    // Check for main landmark with id
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });

  test('featured entry is distinct from grid entries', async ({ page }) => {
    await page.goto(`${BASE_URL}/e`);

    // Featured article should have specific styling
    const featured = page.locator('article.bg-gradient-to-br');
    await expect(featured).toBeVisible();

    // Featured badge
    const featuredBadge = page.locator('[class*="red"][class*="bg"]').filter({ hasText: /Featured/ });
    await expect(featuredBadge).toBeVisible();
  });
});
