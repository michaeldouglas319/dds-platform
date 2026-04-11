import { test, expect } from '@playwright/test';

/**
 * Golden-path tests for the theageofabundance.wiki app.
 *
 * Covers:
 *  - Home → article navigation
 *  - Article page renders the full semantic chrome (h1, landmarks, meta, CTA)
 *  - Broken-slug 404 path surfaces the "Article not found" state
 *  - Skip-link is present and targets the article body landmark
 *  - Mobile viewport keeps everything reachable
 */

test.describe('theageofabundance.wiki', () => {
  test('home page links to the welcome article', async ({ page }) => {
    await page.goto('/');

    const heading = page.getByText('theageofabundance.wiki', { exact: true });
    await expect(heading).toBeVisible();

    const link = page.getByRole('link', { name: /Read the welcome article/ });
    await expect(link).toBeVisible();

    await link.click();
    await page.waitForURL('**/article/welcome');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Welcome to the wiki' }),
    ).toBeVisible();
  });

  test('welcome article renders the full editorial chrome', async ({ page }) => {
    await page.goto('/article/welcome');

    // Single h1
    const h1s = page.getByRole('heading', { level: 1 });
    await expect(h1s).toHaveCount(1);
    await expect(h1s.first()).toHaveText('Welcome to the wiki');

    // Eyebrow metadata
    await expect(page.getByText('GUIDE', { exact: false })).toBeVisible();
    await expect(page.getByText(/3 min read/)).toBeVisible();

    // Lede
    await expect(
      page.getByText(/A living reference for the ideas, maps, and practices/),
    ).toBeVisible();

    // Byline + last updated
    await expect(page.getByText('By The Editors')).toBeVisible();
    await expect(page.getByText(/Last updated/)).toBeVisible();

    // At least one section heading and one body paragraph
    await expect(
      page.getByRole('heading', { level: 2, name: 'What this is' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'How to read it' }),
    ).toBeVisible();

    // Citation link opens in a new tab with noopener
    const citation = page.getByRole('link', {
      name: /Vannevar Bush — As We May Think/,
    });
    await expect(citation).toBeVisible();
    await expect(citation).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(citation).toHaveAttribute('target', '_blank');

    // Footer CTA back to home
    const cta = page.getByRole('link', { name: /Back to the wiki home/ });
    await expect(cta).toBeVisible();

    // Article landmark exists and is labelled
    const article = page.getByRole('article');
    await expect(article).toBeVisible();
    await expect(article).toHaveAttribute('aria-labelledby', /dds-article-title/);
  });

  test('skip link targets the article body landmark', async ({ page }) => {
    await page.goto('/article/welcome');
    const skip = page.getByRole('link', { name: 'Skip to article body' });
    const href = await skip.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href!.startsWith('#')).toBe(true);

    const target = page.locator(href!);
    await expect(target).toHaveAttribute('tabindex', '-1');
    const tag = await target.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe('main');
  });

  test('unknown slug renders the 404 not-found surface', async ({ page }) => {
    const res = await page.goto('/article/does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Article not found' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to the wiki home/ })).toBeVisible();
  });

  test('article page is fully reachable on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/article/welcome');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Welcome to the wiki' }),
    ).toBeVisible();

    // CTA remains reachable and meets the ≥44px tap target
    const cta = page.getByRole('link', { name: /Back to the wiki home/ });
    await expect(cta).toBeVisible();
    const box = await cta.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test('<head> metadata reflects the article title', async ({ page }) => {
    await page.goto('/article/welcome');
    await expect(page).toHaveTitle(/Welcome to the wiki/);
  });
});
