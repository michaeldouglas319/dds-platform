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

  test('article header renders normalized wiki metadata', async ({ page }) => {
    // Deep-link to a specific, known article so the assertions are stable.
    await page.goto(`${WIKI}/a/age-of-abundance`);

    const meta = page.locator('dl.wiki-article__meta');
    await expect(meta).toBeVisible();
    await expect(meta).toHaveAttribute('aria-label', /article metadata/i);

    // Last updated row uses a <time> with a valid datetime.
    const updatedRow = meta.locator('[data-meta="updated"]');
    await expect(updatedRow).toBeVisible();
    const time = updatedRow.locator('time');
    await expect(time).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);

    // Authors row renders human-readable byline.
    const authorsRow = meta.locator('[data-meta="authors"]');
    await expect(authorsRow).toBeVisible();
    await expect(authorsRow.locator('dt')).toHaveText(/by/i);
    await expect(authorsRow.locator('dd')).not.toBeEmpty();

    // Reading-time row: "N min" + aria-label announcing minute read.
    const readingRow = meta.locator('[data-meta="reading"]');
    await expect(readingRow).toBeVisible();
    await expect(readingRow.locator('dd')).toContainText(/\d+\s*min/);
    await expect(readingRow.locator('[aria-label*="minute read"]')).toBeVisible();

    // Word-count row (derived at build time by the normalizer).
    const wordRow = meta.locator('[data-meta="wordcount"]');
    await expect(wordRow).toBeVisible();
    await expect(wordRow.locator('dd')).toContainText(/\d+\s+words/);

    // Tags row has at least one chip.
    const tagsRow = meta.locator('[data-meta="tags"]');
    await expect(tagsRow).toBeVisible();
    const tagChips = tagsRow.locator('li.wiki-article__tag');
    expect(await tagChips.count()).toBeGreaterThan(0);
  });

  test('article card shows tag chips and word count', async ({ page }) => {
    await page.goto(`${WIKI}/`);
    const firstCard = page.locator('.article-card').first();
    await expect(firstCard).toBeVisible();

    // Tags chip list rendered inside the card.
    const cardTags = firstCard.locator('ul.article-card__tags li.article-card__tag');
    expect(await cardTags.count()).toBeGreaterThan(0);

    // CTA line includes both reading time ("N min") and word count ("N words").
    const cta = firstCard.locator('.article-card__reading');
    await expect(cta).toContainText(/\d+\s*min/);
    await expect(cta).toContainText(/\d+\s*words/);
  });
});
