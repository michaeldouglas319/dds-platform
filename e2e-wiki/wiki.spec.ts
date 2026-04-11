import { test, expect } from '@playwright/test';

test.describe('ageofabundance.wiki — golden path', () => {
  test('index page renders seeded articles with landmarks and skip link', async ({ page }) => {
    await page.goto('/');

    // Semantic landmarks
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();

    // Skip link exists and targets main content
    const skipLink = page.locator('a.wiki-skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main-content');

    // Headline
    await expect(
      page.getByRole('heading', { level: 1, name: /working definition, written in public/i }),
    ).toBeVisible();

    // At least one seeded article card
    await expect(
      page.getByRole('heading', { level: 2, name: 'The Age of Abundance' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Energy Abundance' }),
    ).toBeVisible();
  });

  test('navigating into an article keeps h1 semantics and renders body', async ({ page }) => {
    await page.goto('/wiki/age-of-abundance');

    await expect(page).toHaveTitle(/The Age of Abundance/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'The Age of Abundance' }),
    ).toBeVisible();

    // Body paragraphs are server-rendered
    const article = page.locator('article[data-slug="age-of-abundance"]');
    await expect(article).toBeVisible();
    await expect(article).toContainText('civilizational transition');
  });

  test('resolved wiki-links become internal anchors to the right slug', async ({ page }) => {
    await page.goto('/wiki/age-of-abundance');

    // The seeded body contains [[Energy Abundance|cheap clean energy]]
    const resolved = page.getByRole('link', { name: 'cheap clean energy' });
    await expect(resolved).toBeVisible();
    await expect(resolved).toHaveAttribute('href', '/wiki/energy-abundance');
    await expect(resolved).toHaveAttribute('data-broken', 'false');

    // Click through and verify we landed on the target article
    await resolved.click();
    await page.waitForURL('**/wiki/energy-abundance');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Energy Abundance' }),
    ).toBeVisible();
  });

  test('broken wiki-links render with data-broken=true and aria-disabled', async ({ page }) => {
    await page.goto('/wiki/age-of-abundance');

    // Seed body intentionally references [[Nowhere Article]]
    const broken = page.locator('.wiki-link--broken', { hasText: 'Nowhere Article' });
    await expect(broken).toBeVisible();
    await expect(broken).toHaveAttribute('data-broken', 'true');
    await expect(broken).toHaveAttribute('aria-disabled', 'true');

    // A broken link must NOT be a real anchor
    expect(await broken.evaluate((el) => el.tagName)).toBe('SPAN');

    // Every broken link in the body is rendered with the same broken state
    const allBroken = page.locator('.wiki-link--broken');
    const count = await allBroken.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('backlinks panel lists articles that reference the current one', async ({ page }) => {
    // Age of Abundance is referenced by several other articles.
    await page.goto('/wiki/age-of-abundance');
    // `<aside aria-label>` has an implicit role of "complementary"
    const backlinkPanel = page.getByRole('complementary', { name: /metadata and backlinks/i });
    await expect(backlinkPanel).toBeVisible();
    await expect(backlinkPanel.getByRole('link', { name: 'Scarcity Inversion' })).toBeVisible();
    await expect(backlinkPanel.getByRole('link', { name: 'Energy Abundance' })).toBeVisible();
  });

  test('an unknown slug returns the wiki 404 page', async ({ page }) => {
    const response = await page.goto('/wiki/this-slug-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { level: 1, name: /does not exist yet/i }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /back to the wiki index/i })).toBeVisible();
  });

  test('responsive: mobile viewport still renders the landmarks', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/wiki/energy-abundance');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Energy Abundance' }),
    ).toBeVisible();
  });
});
