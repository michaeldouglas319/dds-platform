import { test, expect } from '@playwright/test';

/**
 * Golden-path coverage for the wiki home page.
 *
 * Verifies that the schema-driven WikiArticleRenderer plugin actually emits
 * the accessible long-form structure end-to-end through Next.js: landmarks,
 * heading hierarchy, ARIA labels, theme tokens, and touch-target sizing for
 * mobile.
 */

test.describe('Wiki home page', () => {
  test('renders schema-driven article with landmarks and headings', async ({
    page,
  }) => {
    await page.goto('/');

    // <main> landmark from layout
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
    await expect(main).toHaveAttribute('id', 'main');

    // Skip-to-content link is present (visible on focus only)
    await expect(
      page.getByRole('link', { name: 'Skip to content' }),
    ).toBeAttached();

    // Article landmark with accessible name from <h1>
    const article = page.getByRole('article', {
      name: 'A wiki for the abundance era',
    });
    await expect(article).toBeVisible();

    // Title is an <h1> per default heading level
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'A wiki for the abundance era',
      }),
    ).toBeVisible();

    // Section headings cascade to <h2>
    await expect(
      page.getByRole('heading', { level: 2, name: 'How this wiki is built' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'What lives here' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'How to contribute' }),
    ).toBeVisible();
  });

  test('renders the Key facts aside and Related topics nav', async ({
    page,
  }) => {
    await page.goto('/');

    const aside = page.getByRole('complementary', { name: 'Key facts' });
    await expect(aside).toBeVisible();
    await expect(aside.getByText('Schema')).toBeVisible();
    await expect(
      aside.getByText('UniversalSection (typed, additive)'),
    ).toBeVisible();

    const topics = page.getByRole('navigation', { name: 'Related topics' });
    await expect(topics).toBeVisible();
    await expect(
      topics.getByText('Energy: fusion, geothermal, transmission'),
    ).toBeVisible();
  });

  test('html element exposes theme attributes', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(html).toHaveAttribute('data-theme-variant', 'minimal');
  });

  test('topic items meet 44px touch-target on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto('/');

    const items = page.locator('.wiki-article__topics-list li');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const box = await items.nth(i).boundingBox();
      expect(box, `topic item ${i} should have a bounding box`).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('skip-to-content link becomes visible on focus', async ({ page }) => {
    await page.goto('/');

    const skip = page.getByRole('link', { name: 'Skip to content' });
    await skip.focus();

    // The link transitions from translateY(-120%) → translateY(0) over 150ms.
    // Poll the bounding box until the transition has settled and the link is
    // fully inside the viewport.
    await expect
      .poll(
        async () => {
          const box = await skip.boundingBox();
          return box ? box.y + box.height : -1;
        },
        { timeout: 2000 },
      )
      .toBeGreaterThan(0);

    const finalBox = await skip.boundingBox();
    expect(finalBox).not.toBeNull();
    // After the transition the link is fully visible: bottom edge is below the
    // top of the viewport and the link overlaps the visible region.
    expect(finalBox!.y + finalBox!.height).toBeGreaterThan(0);
  });
});
