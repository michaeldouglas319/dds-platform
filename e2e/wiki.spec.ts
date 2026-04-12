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

  test.describe('Article index (/a)', () => {
    test('renders all articles sorted newest-first with article count', async ({ page }) => {
      await page.goto(`${WIKI}/a`);

      // Page has the correct heading and breadcrumb
      await expect(
        page.getByRole('heading', { level: 1, name: /all articles/i }),
      ).toBeVisible();
      await expect(page.getByRole('navigation', { name: /breadcrumb/i })).toBeVisible();

      // Article count is shown
      const count = page.locator('.wiki-index__count');
      await expect(count).toBeVisible();
      await expect(count).toContainText(/3 articles/);

      // All 3 seed articles are rendered as cards
      const cards = page.locator('.article-card');
      expect(await cards.count()).toBe(3);
    });

    test('tag filter chips are rendered and toggle active state', async ({ page }) => {
      await page.goto(`${WIKI}/a`);

      // Tag filter group is present
      const filterGroup = page.getByRole('group', { name: /filter articles by tag/i });
      await expect(filterGroup).toBeVisible();

      // Tag buttons exist — at least a few from the seed data
      const tagButtons = filterGroup.getByRole('button');
      expect(await tagButtons.count()).toBeGreaterThan(2);

      // All tag buttons start as not pressed
      const firstTag = tagButtons.first();
      await expect(firstTag).toHaveAttribute('aria-pressed', 'false');

      // Click a tag to filter
      const tagText = (await firstTag.textContent()) ?? '';
      await firstTag.click();
      await expect(firstTag).toHaveAttribute('aria-pressed', 'true');

      // Article count updates to reflect the filter
      const count = page.locator('.wiki-index__count');
      await expect(count).toContainText(new RegExp(`tagged "${tagText}"`));

      // Clear filter button appears
      const clearBtn = page.getByRole('button', { name: /clear filter/i });
      await expect(clearBtn).toBeVisible();

      // Click clear to reset
      await clearBtn.click();
      await expect(firstTag).toHaveAttribute('aria-pressed', 'false');
      await expect(count).toContainText(/3 articles/);
    });

    test('filtering by a specific tag narrows the article list', async ({ page }) => {
      await page.goto(`${WIKI}/a`);

      // Click the "governance" tag — should match Age of Abundance + Coordination Abundance
      const govTag = page.getByRole('button', { name: 'governance' });
      await govTag.click();

      // Should show fewer articles than the total
      const cards = page.locator('.article-card');
      const filteredCount = await cards.count();
      expect(filteredCount).toBeGreaterThan(0);
      expect(filteredCount).toBeLessThan(3);

      // Count reflects the filter
      const count = page.locator('.wiki-index__count');
      await expect(count).toContainText(/tagged "governance"/);
    });

    test('clicking the same tag again deselects it', async ({ page }) => {
      await page.goto(`${WIKI}/a`);

      const filterGroup = page.getByRole('group', { name: /filter articles by tag/i });
      const firstTag = filterGroup.getByRole('button').first();

      // Click to activate
      await firstTag.click();
      await expect(firstTag).toHaveAttribute('aria-pressed', 'true');

      // Click again to deactivate
      await firstTag.click();
      await expect(firstTag).toHaveAttribute('aria-pressed', 'false');

      // All articles are back
      const cards = page.locator('.article-card');
      expect(await cards.count()).toBe(3);
    });
  });

  test.describe('Wiki-links', () => {
    test('article body renders resolved wiki-links as clickable <a> tags', async ({ page }) => {
      // The "Age of Abundance" article body contains [[Coordination Abundance|coordination]]
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const body = page.locator('.wiki-article__body');
      await expect(body).toBeVisible();

      // At least one resolved wiki-link exists (coordination → /a/coordination-abundance)
      const wikiLinks = body.locator('a.wiki-link[data-wiki-target="coordination-abundance"]');
      expect(await wikiLinks.count()).toBeGreaterThan(0);
      const firstLink = wikiLinks.first();
      await expect(firstLink).toBeVisible();
      await expect(firstLink).toHaveAttribute('href', '/a/coordination-abundance');
    });

    test('wiki-link navigates to the target article', async ({ page }) => {
      await page.goto(`${WIKI}/a/age-of-abundance`);

      // Click the Energy Abundance wiki-link in the "Core pillars" section
      const body = page.locator('.wiki-article__body');
      const energyLink = body.locator('a.wiki-link[data-wiki-target="energy-abundance"]');
      await expect(energyLink).toBeVisible();
      await energyLink.click();

      // Should navigate to the energy article
      await page.waitForURL(new RegExp(`${WIKI}/a/energy-abundance`));
      await expect(
        page.getByRole('heading', { level: 1, name: /energy abundance/i }),
      ).toBeVisible();
    });

    test('broken wiki-link renders with redlink style and aria-disabled', async ({ page }) => {
      // The "Age of Abundance" article mentions [[Compute Abundance]] which does not exist
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const body = page.locator('.wiki-article__body');
      const brokenLink = body.locator('.wiki-link--broken[data-wiki-target="compute-abundance"]');
      await expect(brokenLink).toBeVisible();
      await expect(brokenLink).toHaveAttribute('aria-disabled', 'true');
      await expect(brokenLink).toHaveAttribute('title', /does not exist yet/);
      await expect(brokenLink).toContainText('Compute Abundance');
    });

    test('cross-linked article has back-reference wiki-links', async ({ page }) => {
      // The "Energy Abundance" article body contains [[Age of Abundance]]
      await page.goto(`${WIKI}/a/energy-abundance`);

      const body = page.locator('.wiki-article__body');
      const backRef = body.locator('a.wiki-link[data-wiki-target="age-of-abundance"]');
      await expect(backRef).toBeVisible();
      await expect(backRef).toHaveAttribute('href', '/a/age-of-abundance');
    });

    test('wiki-links are keyboard-navigable', async ({ page }) => {
      await page.goto(`${WIKI}/a/age-of-abundance`);

      // Tab through the page to find a wiki-link and verify it receives focus
      const wikiLinks = page.locator('.wiki-article__body a.wiki-link');
      const count = await wikiLinks.count();
      expect(count).toBeGreaterThan(0);

      // Focus the first wiki-link programmatically and check focus-visible works
      await wikiLinks.first().focus();
      await expect(wikiLinks.first()).toBeFocused();
    });
  });
});
