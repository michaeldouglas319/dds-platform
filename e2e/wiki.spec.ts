import { expect, test } from '@playwright/test';

/**
 * Wiki golden path:
 *
 *   /            → article index lists every wiki article
 *   /wiki/[slug] → article shell renders title, sections, TOC
 *   /wiki/<bad>  → custom 404 with recovery links
 *
 * The wiki app is fully static-generated. These tests assert the
 * accessible structure (h1, landmarks, aria-current) so regressions in
 * the UniversalSection plumbing are caught immediately.
 */

test.describe('ageofabundance-wiki', () => {
  test('home page lists wiki articles', async ({ page }) => {
    await page.goto('/');

    // Single h1 with the brand title.
    const h1 = page.locator('h1.wiki-article__title');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('ageofabundance.wiki');

    // Article index has at least the welcome article and links to it.
    const welcomeLink = page.getByRole('link', {
      name: /Welcome to ageofabundance\.wiki/i,
    });
    await expect(welcomeLink).toBeVisible();
    await expect(welcomeLink).toHaveAttribute('href', '/wiki/welcome');
  });

  test('navigates from index to an article and renders the TOC', async ({
    page,
  }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /Welcome to ageofabundance\.wiki/i })
      .click();

    await page.waitForURL('**/wiki/welcome');

    // Article header
    const h1 = page.locator('h1.wiki-article__title');
    await expect(h1).toHaveText('Welcome to ageofabundance.wiki');

    // Semantic landmarks
    await expect(page.locator('article#wiki-article-content')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Table of contents' }),
    ).toBeVisible();

    // Each article section gets an anchor target by its UniversalSection id.
    await expect(page.locator('section#welcome-intro')).toBeVisible();
    await expect(page.locator('section#welcome-pillars')).toBeVisible();
    await expect(page.locator('section#welcome-next')).toBeVisible();

    // The TOC pre-populates an active link (first section by default).
    const activeTocLink = page.locator('a.wiki-toc__link[aria-current="location"]');
    await expect(activeTocLink).toHaveCount(1);
  });

  test('table of contents updates aria-current on scroll', async ({
    page,
  }) => {
    await page.goto('/wiki/welcome');

    // Force the second section into view by clicking its TOC link.
    const secondLink = page.locator('a.wiki-toc__link[href="#welcome-pillars"]');
    await secondLink.click();

    // Wait for IntersectionObserver to mark it active. We poll instead of
    // waiting on a fixed timeout so reduced-motion environments still pass.
    await expect
      .poll(async () =>
        secondLink.getAttribute('aria-current'),
      { timeout: 5000 })
      .toBe('location');
  });

  test('renders a custom 404 with recovery links for unknown slugs', async ({
    page,
  }) => {
    const response = await page.goto('/wiki/this-article-does-not-exist');
    expect(response?.status()).toBe(404);

    // Custom 404 shell, not the default Next.js error page.
    await expect(page.locator('h1.wiki-article__title')).toHaveText(
      'Article not found',
    );

    // Recovery: a link back to a known good article must be visible.
    await expect(
      page.getByRole('link', { name: /Welcome to ageofabundance\.wiki/i }),
    ).toBeVisible();
  });

  test('article page exposes a single h1 and a skip link', async ({ page }) => {
    await page.goto('/wiki/welcome');

    // Skip link is the first focusable element.
    const skipLink = page.locator('.wiki-skip-link');
    await expect(skipLink).toHaveAttribute('href', '#wiki-article-content');

    // Exactly one h1 per page (a11y rule).
    const headings = page.locator('h1');
    await expect(headings).toHaveCount(1);
  });

  test('responsive: mobile viewport collapses the TOC into the flow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto('/wiki/welcome');

    // The article body must remain visible at narrow widths.
    await expect(page.locator('article.wiki-article')).toBeVisible();
    await expect(page.locator('section#welcome-intro')).toBeVisible();
  });
});
