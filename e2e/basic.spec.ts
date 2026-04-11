import { test, expect } from '@playwright/test';

test.describe('ageofabundance.wiki — home article (wiki-article plugin)', () => {
  test('home renders a semantic <article> landmark with an h1', async ({
    page,
  }) => {
    await page.goto('/');

    const article = page.getByRole('article');
    await expect(article).toBeVisible();

    const h1 = article.getByRole('heading', { level: 1, name: 'Age of Abundance' });
    await expect(h1).toBeVisible();
  });

  test('lede, subtitle, and category are surfaced', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByText('A post-scarcity civilization operating manual'),
    ).toBeVisible();
    await expect(
      page.getByText(/An open, living wiki about the transition/),
    ).toBeVisible();
    await expect(page.getByText('Overview', { exact: true })).toBeVisible();
  });

  test('h2 sections have stable slugged anchor IDs and permalinks', async ({
    page,
  }) => {
    await page.goto('/');

    const whatIsHeading = page.getByRole('heading', {
      level: 2,
      name: /What this wiki is/,
    });
    await expect(whatIsHeading).toBeVisible();
    await expect(whatIsHeading).toHaveAttribute(
      'id',
      'wiki-article-home-what-this-wiki-is',
    );

    const howBuiltHeading = page.getByRole('heading', {
      level: 2,
      name: /How it is built/,
    });
    await expect(howBuiltHeading).toHaveAttribute(
      'id',
      'wiki-article-home-how-it-is-built',
    );

    const permalink = page.getByRole('link', {
      name: 'Permalink to section: What this wiki is',
    });
    await expect(permalink).toHaveAttribute(
      'href',
      '#wiki-article-home-what-this-wiki-is',
    );
  });

  test('clicking a permalink scrolls the section into view', async ({ page }) => {
    await page.goto('/');

    await page
      .getByRole('link', { name: 'Permalink to section: How it is built' })
      .click();

    await expect(page).toHaveURL(/#wiki-article-home-how-it-is-built$/);
    const heading = page.getByRole('heading', {
      level: 2,
      name: /How it is built/,
    });
    await expect(heading).toBeInViewport();
  });

  test('citations render as an ordered list of outbound links', async ({
    page,
  }) => {
    await page.goto('/');

    const citations = page.getByRole('list', { name: 'Citations' });
    await expect(citations).toBeVisible();
    const citationLink = citations.getByRole('link', {
      name: 'UniversalSection schema',
    });
    await expect(citationLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('see-also label is overridable via meta.seeAlsoLabel', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { level: 2, name: 'Further reading' }),
    ).toBeVisible();
    await expect(page.getByText('Economic primitives')).toBeVisible();
    await expect(page.getByText('Governance patterns')).toBeVisible();
  });

  test('skip link is keyboard-accessible', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Skip to article' });
    await expect(skipLink).toBeFocused();
  });

  test('layout is responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const article = page.getByRole('article');
    await expect(article).toBeVisible();
    const box = await article.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
  });

  test('theme variant attribute is set on <html>', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(html).toHaveAttribute('data-theme-variant', 'minimal');
  });
});
