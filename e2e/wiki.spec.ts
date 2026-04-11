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

  test('article header surfaces derived meta.wiki fields', async ({ page }) => {
    // age-of-abundance ships with authors + tags + updated date; word count
    // and reading time are DERIVED by deriveWikiMeta from the body text.
    await page.goto(`${WIKI}/a/age-of-abundance`);

    const metaList = page.locator('.wiki-article__meta');
    await expect(metaList).toBeVisible();

    // Last updated — formatted via the helper, not the raw ISO string.
    await expect(metaList).toContainText(/last updated/i);
    await expect(metaList.locator('time')).toHaveAttribute('datetime', '2026-04-11');
    await expect(metaList.locator('time')).toContainText('April 11, 2026');

    // Reading time + word count are derived; assert shape (non-empty number +
    // unit) without pinning the exact value so tweaks to copy stay safe.
    await expect(metaList).toContainText(/reading time/i);
    await expect(metaList).toContainText(/\d+\s*min/);
    await expect(metaList).toContainText(/word count/i);

    const wordCountEl = metaList.locator('.wiki-article__word-count');
    await expect(wordCountEl).toBeVisible();
    const wordCountText = (await wordCountEl.textContent()) ?? '';
    expect(Number(wordCountText.replace(/,/g, ''))).toBeGreaterThan(100);

    // Authors list — normalized by the helper, rendered as a ul.
    const authors = metaList.locator('.wiki-article__author');
    expect(await authors.count()).toBeGreaterThan(0);

    // Tags list — normalized (lowercased) by the helper.
    const tags = metaList.locator('.wiki-article__tag');
    expect(await tags.count()).toBeGreaterThan(0);
    await expect(tags.first()).toContainText(/^[a-z0-9 -]+$/);

    // Schema.org Article JSON-LD is emitted from the same derived meta.
    const ldScript = page.locator('script[type="application/ld+json"]');
    await expect(ldScript).toHaveCount(1);
    const ldJson = JSON.parse((await ldScript.textContent()) ?? '{}');
    expect(ldJson['@type']).toBe('Article');
    expect(ldJson.headline).toMatch(/age of abundance/i);
    expect(ldJson.wordCount).toBeGreaterThan(100);
    expect(ldJson.dateModified).toBe('2026-04-11');
    expect(Array.isArray(ldJson.author)).toBe(true);
    expect(ldJson.author.length).toBeGreaterThan(0);
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

  test('inline wiki-links render as internal <a> or broken span', async ({ page }) => {
    // The age-of-abundance article body seeds four cross-links:
    //   - [[Energy Abundance]]        → resolved
    //   - [[Coordination Abundance]]  → resolved
    //   - [[Compute Abundance]]       → broken (article not in seed)
    //   - [[Atoms Abundance]]         → broken (article not in seed)
    // This test locks down the three contract promises:
    //   1. resolved wiki-links render as <a> with href /a/<slug>
    //   2. broken wiki-links render as a span, never an <a>, and carry an
    //      aria-label starting with "Broken wiki link"
    //   3. clicking a resolved wiki-link navigates to that article
    await page.goto(`${WIKI}/a/age-of-abundance`);

    const articleBody = page.locator('.wiki-article__body');
    await expect(articleBody).toBeVisible();

    // (1) resolved link: <a class="wiki-link"> pointing at /a/energy-abundance
    const energyLink = articleBody.locator('a.wiki-link[href="/a/energy-abundance"]');
    await expect(energyLink).toHaveCount(1);
    await expect(energyLink).toContainText(/energy abundance/i);

    const coordLink = articleBody.locator(
      'a.wiki-link[href="/a/coordination-abundance"]',
    );
    await expect(coordLink).toHaveCount(1);

    // (2) broken link: span.wiki-link--broken with an aria-label. Must NOT
    // be an <a>, so a pure CSS selector by tag + class proves the contract.
    const brokenSpans = articleBody.locator('span.wiki-link--broken');
    const brokenCount = await brokenSpans.count();
    expect(brokenCount).toBeGreaterThanOrEqual(1);
    await expect(brokenSpans.first()).toHaveAttribute(
      'aria-label',
      /^Broken wiki link: /,
    );
    // No <a> element should ever carry the broken modifier class.
    await expect(articleBody.locator('a.wiki-link--broken')).toHaveCount(0);

    // (3) navigate via a real wiki-link click — golden path.
    await energyLink.click();
    await page.waitForURL(`${WIKI}/a/energy-abundance`);
    await expect(
      page.locator('article.wiki-article').getByRole('heading', { level: 1 }),
    ).toContainText(/energy abundance/i);
  });
});
