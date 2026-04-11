import { test, expect } from '@playwright/test';

// The wiki app runs on its own port alongside the default blackdot-dev
// webServer (see playwright.config.ts → webServer array).
const WIKI = 'http://localhost:3101';

test.describe('Age of Abundance wiki', () => {
  test('home page renders hero and featured articles', async ({ page }) => {
    await page.goto(`${WIKI}/`);

    // Route announcer target + SR landmark
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/living encyclopedia/i);

    // Featured section heading
    await expect(
      page.getByRole('heading', { level: 2, name: /featured articles/i }),
    ).toBeVisible();

    // At least one article card rendered
    const cards = page.locator('.article-card');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);

    // Card titles come from the seed UniversalSection dataset
    await expect(
      page.getByRole('heading', { level: 2, name: /age of abundance/i }),
    ).toBeVisible();
  });

  test('home → article golden path', async ({ page }) => {
    await page.goto(`${WIKI}/`);

    const firstCardLink = page.locator('.article-card__link').first();
    await firstCardLink.click();

    await page.waitForURL(new RegExp(`${WIKI}/a/.+`));

    // Article has a semantic article landmark with a labelled h1
    const article = page.locator('article.wiki-article');
    await expect(article).toBeVisible();

    const articleH1 = article.getByRole('heading', { level: 1 });
    await expect(articleH1).toBeVisible();

    // Lede is present
    await expect(page.locator('.wiki-article__lede')).toBeVisible();

    // Breadcrumb back-link is present
    await expect(page.getByRole('navigation', { name: /breadcrumb/i })).toBeVisible();
  });

  test('unknown slug 404s with semantic not-found page', async ({ page }) => {
    const response = await page.goto(`${WIKI}/a/this-article-does-not-exist`);
    expect(response?.status()).toBe(404);

    await expect(
      page.getByRole('heading', { level: 1, name: /not found/i }),
    ).toBeVisible();
  });

  test('skip link appears when focused', async ({ page }) => {
    await page.goto(`${WIKI}/`);
    const skip = page.locator('.wiki-skip-link');
    await skip.focus();
    await expect(skip).toBeVisible();
    await expect(skip).toContainText(/skip to main content/i);
  });
});
