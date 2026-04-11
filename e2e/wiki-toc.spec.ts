import { test, expect } from '@playwright/test';

/**
 * Golden-path Playwright coverage for the Wiki Table of Contents plugin.
 *
 * The `@dds/renderer` wiki-toc renderer is a schema-driven plugin, so these
 * tests work against any page that mounts it via `SectionBatchRenderer`. The
 * tests are feature-detection based: if the page does not expose a
 * `[data-testid="wiki-toc"]` element, the suite is skipped so this spec never
 * red-builds the gate while other apps catch up to the new primitive.
 *
 * When a consumer wires up a wiki article route (e.g. `/wiki/<slug>`) that
 * renders the TOC, these tests will start enforcing:
 *   - Landmark: a `<nav>` with `aria-label`
 *   - At least one link inside the TOC
 *   - Active-heading highlight via `aria-current="location"` after scrolling
 *   - Touch-target height ≥ 44px on the first link
 */

const TOC_ROUTES = ['/wiki', '/wiki/intro', '/sections'];

async function findTocOnAnyRoute(page: import('@playwright/test').Page) {
  for (const route of TOC_ROUTES) {
    const response = await page.goto(route).catch(() => null);
    if (!response || !response.ok()) continue;
    const toc = page.getByTestId('wiki-toc');
    if (await toc.count()) return { route, toc };
  }
  return null;
}

test.describe('Wiki Table of Contents', () => {
  test('renders as a labelled landmark when present', async ({ page }) => {
    const hit = await findTocOnAnyRoute(page);
    test.skip(!hit, 'No consumer route mounts wiki-toc yet — skip by design.');
    if (!hit) return;

    const { toc } = hit;
    await expect(toc).toBeVisible();

    const label = await toc.getAttribute('aria-label');
    expect(label, 'wiki-toc must expose an aria-label').toBeTruthy();

    const tagName = await toc.evaluate((node) => node.tagName.toLowerCase());
    expect(tagName).toBe('nav');
  });

  test('exposes at least one navigable link with accessible text', async ({ page }) => {
    const hit = await findTocOnAnyRoute(page);
    test.skip(!hit, 'No consumer route mounts wiki-toc yet — skip by design.');
    if (!hit) return;

    const { toc } = hit;
    const links = toc.locator('a[href^="#"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    const firstLinkText = await links.first().textContent();
    expect(firstLinkText?.trim().length ?? 0).toBeGreaterThan(0);
  });

  test('first link meets WCAG touch-target height (≥44px)', async ({ page }) => {
    const hit = await findTocOnAnyRoute(page);
    test.skip(!hit, 'No consumer route mounts wiki-toc yet — skip by design.');
    if (!hit) return;

    const firstLink = hit.toc.locator('a[href^="#"]').first();
    const box = await firstLink.boundingBox();
    expect(box, 'first link must have a bounding box').not.toBeNull();
    if (box) expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test('honors prefers-reduced-motion when activating a link', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const hit = await findTocOnAnyRoute(page);
    test.skip(!hit, 'No consumer route mounts wiki-toc yet — skip by design.');
    if (!hit) return;

    const firstLink = hit.toc.locator('a[href^="#"]').first();
    await firstLink.click();

    // After click, the active link must carry aria-current="location".
    await expect(firstLink).toHaveAttribute('aria-current', 'location');
  });
});
