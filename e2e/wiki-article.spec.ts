import { test, expect } from '@playwright/test';

/**
 * Golden-path coverage for the wiki article page on the
 * @dds/ageofabundance-wiki app. Runs against a dedicated webServer on
 * port 3100 via the `wiki` project in playwright.config.ts.
 */

test.describe('ageofabundance-wiki — article page', () => {
  test('home page lists the seeded articles and links to them', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-testid="wiki-home"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="wiki-home-article-list"] li'),
    ).toHaveCount(2);

    const link = page.getByRole('link', { name: 'Principles of Abundance' });
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toBe('/wiki/abundance-principles');

    await expect(
      page.getByRole('link', { name: 'The Universal Section Schema' }),
    ).toBeVisible();
  });

  test('article page renders title, summary, infobox and body', async ({ page }) => {
    await page.goto('/wiki/abundance-principles');

    await expect(page).toHaveTitle(/Principles of Abundance/);
    await expect(
      page.locator('[data-testid="wiki-article-title"]'),
    ).toHaveText('Principles of Abundance');
    await expect(
      page.locator('[data-testid="wiki-article-category"]'),
    ).toHaveText('Core concepts');
    await expect(
      page.locator('[data-testid="wiki-article-summary"]'),
    ).toContainText('foundational overview');

    const infobox = page.locator('[data-testid="wiki-infobox"]');
    await expect(infobox).toBeVisible();
    await expect(infobox.locator('h2')).toHaveText('Principles of Abundance');

    const bodySections = page.locator(
      '[data-testid="wiki-article-body"] [data-testid="wiki-body-section"]',
    );
    await expect(bodySections).toHaveCount(4);

    await expect(
      page.getByRole('heading', { level: 2, name: 'Overview' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Cooperation over competition' }),
    ).toBeVisible();
  });

  test('article page exposes a table-of-contents nav with in-page anchors', async ({
    page,
  }) => {
    await page.goto('/wiki/abundance-principles');

    const toc = page.getByRole('navigation', { name: 'Table of contents' });
    await expect(toc).toBeVisible();

    const tocLinks = toc.getByRole('link');
    await expect(tocLinks).toHaveCount(4);

    const firstLink = tocLinks.first();
    const href = await firstLink.getAttribute('href');
    expect(href).toMatch(/^#section-/);
  });

  test('unknown slug renders the not-found state', async ({ page }) => {
    const response = await page.goto('/wiki/does-not-exist-1234');
    expect(response?.status()).toBe(404);
    await expect(
      page.locator('[data-testid="wiki-article-not-found"]'),
    ).toBeVisible();
  });

  test('article page is keyboard reachable and has a skip link', async ({ page }) => {
    await page.goto('/wiki/abundance-principles');

    const skipLink = page.getByRole('link', { name: 'Skip to article body' });
    await expect(skipLink).toHaveCount(1);

    const href = await skipLink.getAttribute('href');
    expect(href).toBe('#wiki-article-body');

    const main = page.locator('main[data-testid="wiki-article"]');
    await expect(main).toBeVisible();
  });
});
