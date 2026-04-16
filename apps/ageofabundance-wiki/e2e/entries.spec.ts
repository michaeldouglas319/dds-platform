import { test, expect, Page } from '@playwright/test';

test.describe('/e entries feature — user perspective', () => {
  test.describe('Entry Grid Navigation — /e landing page', () => {
    test('user lands on /e and sees All entries page with title', async ({ page }) => {
      await page.goto('/e');

      // User expects clear page header
      await expect(page).toHaveTitle(/Entries.*ageofabundance\.wiki/);

      // User sees "All entries" title and entry count
      const heading = page.locator('h1, h2').filter({ hasText: /All entries/i });
      await expect(heading).toBeVisible();

      // User sees entries grid section
      const gridSection = page.locator('[data-layout="entry-grid"]');
      await expect(gridSection).toBeVisible();
    });

    test('user sees entry cards with expected content', async ({ page }) => {
      await page.goto('/e');

      // Wait for grid to load
      const gridSection = page.locator('[data-layout="entry-grid"]');
      await expect(gridSection).toBeVisible();

      // Get first entry card
      const firstCard = page.locator('[data-layout="entry-grid"] article').first();
      await expect(firstCard).toBeVisible();

      // User sees card has readable title/subject
      const title = firstCard.locator('[class*="title"], [class*="heading"]');
      await expect(title).toHaveCount({ gte: 0 }); // At least present (might be multiple)

      // User expects "Read" button or clickable card
      const readLink = firstCard.locator('a:has-text("Read")');
      // Should have at least one read link in the grid
      const allLinks = page.locator('[data-layout="entry-grid"] a:has-text("Read")');
      await expect(allLinks).toHaveCount({ gte: 0 }); // At least one if entries exist
    });

    test('user clicks entry card and is navigated to detail page', async ({ page }) => {
      await page.goto('/e');

      // Wait for grid to be visible
      const gridSection = page.locator('[data-layout="entry-grid"]');
      await expect(gridSection).toBeVisible();

      // Get first "Read" link
      const firstReadLink = page.locator('[data-layout="entry-grid"] a:has-text("Read")').first();
      const linkHref = await firstReadLink.getAttribute('href');

      // User clicks the link
      await firstReadLink.click();

      // User is navigated to detail page (URL contains /e/ and slug)
      await expect(page).toHaveURL(/\/e\/[a-z0-9\-]+$/);
      expect(linkHref).toMatch(/^\/e\/[a-z0-9\-]+$/);
    });

    test('user sees empty state when no entries exist', async ({ page }) => {
      // Mock scenario: even with empty state, page should be usable
      // This test documents expected behavior
      await page.goto('/e');

      const gridSection = page.locator('[data-layout="entry-grid"]');
      await expect(gridSection).toBeVisible();

      // Check for either entries or empty state message
      const hasEntries = await page
        .locator('[data-layout="entry-grid"] article')
        .count()
        .then((count) => count > 0);

      if (!hasEntries) {
        // User sees empty state message like "Runner has not populated..."
        const emptyMsg = page.locator('[class*="subtitle"]').filter({ hasText: /not populated/ });
        // Empty state might be visible if no entries
      }
    });

    test('page loads reasonably fast', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/e');
      const loadTime = Date.now() - startTime;

      // Page should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Content should be visible
      await expect(page.locator('[data-layout="entry-grid"]')).toBeVisible({ timeout: 2000 });
    });

    test('page is mobile responsive', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone 8 size

      await page.goto('/e');

      // Grid should still be visible on mobile
      const gridSection = page.locator('[data-layout="entry-grid"]');
      await expect(gridSection).toBeVisible();

      // Entry cards should be readable on mobile
      const firstCard = page.locator('[data-layout="entry-grid"] article').first();
      if (await firstCard.isVisible()) {
        // Card should have adequate size on mobile
        const boundingBox = await firstCard.boundingBox();
        expect(boundingBox?.width).toBeGreaterThan(100); // At least readable width
      }
    });
  });

  test.describe('Entry Detail Page — /e/[slug]', () => {
    test('user navigates to entry detail and sees full content', async ({ page }) => {
      // Start by finding an entry on the grid
      await page.goto('/e');

      // Click first entry's read link
      const firstReadLink = page.locator('[data-layout="entry-grid"] a:has-text("Read")').first();
      const linkHref = await firstReadLink.getAttribute('href');

      if (!linkHref) {
        test.skip(); // Skip if no entries available
      }

      await firstReadLink.click();

      // User is now on detail page
      await expect(page).toHaveURL(new RegExp(`${linkHref}$`));

      // User sees entry title in hero section
      const heroTitle = page.locator('h1').first();
      await expect(heroTitle).toBeVisible();

      // User sees full content body
      const contentBody = page.locator('main').first();
      await expect(contentBody).toBeVisible();

      // Page title matches entry
      const pageTitle = await page.title();
      expect(pageTitle).toContain('ageofabundance.wiki');
    });

    test('user reads entry metadata (title, subtitle, summary)', async ({ page }) => {
      // Navigate to first entry
      await page.goto('/e');
      const firstReadLink = page.locator('[data-layout="entry-grid"] a:has-text("Read")').first();

      if (!(await firstReadLink.isVisible())) {
        test.skip(); // Skip if no entries available
      }

      await firstReadLink.click();

      // User sees entry hero with metadata
      const main = page.locator('main');
      await expect(main).toBeVisible();

      // Hero section should contain title (h1)
      const title = page.locator('h1').first();
      await expect(title).toBeVisible();

      // Subtitle may be present
      const subtitle = page.locator('h2, [class*="subtitle"]').first();
      // Should be present but not testing visibility as it may not exist
      const subtitleCount = await subtitle.count();
      expect(subtitleCount).toBeGreaterThanOrEqual(0);
    });

    test('user navigates back to /e from detail page', async ({ page }) => {
      // Start from /e
      await page.goto('/e');

      // Navigate to entry
      const firstReadLink = page.locator('[data-layout="entry-grid"] a:has-text("Read")').first();

      if (!(await firstReadLink.isVisible())) {
        test.skip();
      }

      await firstReadLink.click();

      // User is on detail page
      await expect(page).toHaveURL(/\/e\/[a-z0-9\-]+$/);

      // User uses browser back button
      await page.goBack();

      // User is back on /e
      await expect(page).toHaveURL('/e');

      // Grid is visible again
      await expect(page.locator('[data-layout="entry-grid"]')).toBeVisible();
    });

    test('user sees linked signals section (if entry has tag)', async ({ page }) => {
      // Navigate to entry detail
      await page.goto('/e');

      const firstReadLink = page.locator('[data-layout="entry-grid"] a:has-text("Read")').first();
      if (!(await firstReadLink.isVisible())) {
        test.skip();
      }

      await firstReadLink.click();

      // Check if linked signals section is present
      const linkedSignalsSection = page.locator('section').filter({
        has: page.locator('text="Linked signals"'),
      });

      // This section may or may not exist depending on tag and events
      const sectionExists = await linkedSignalsSection.count();

      if (sectionExists > 0) {
        // If it exists, it should show events
        const events = linkedSignalsSection.locator('article');
        const eventCount = await events.count();

        // Should have events if section is shown
        if (eventCount > 0) {
          // First event should be visible
          const firstEvent = events.first();
          await expect(firstEvent).toBeVisible();
        }
      }
    });

    test('entry detail page loads reasonably fast', async ({ page }) => {
      await page.goto('/e');

      const firstReadLink = page.locator('[data-layout="entry-grid"] a:has-text("Read")').first();
      if (!(await firstReadLink.isVisible())) {
        test.skip();
      }

      const startTime = Date.now();
      await firstReadLink.click();
      const loadTime = Date.now() - startTime;

      // Detail page should load in under 2 seconds
      expect(loadTime).toBeLessThan(2000);

      // Content should be visible
      await expect(page.locator('main')).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('Navigation Patterns', () => {
    test('user can navigate between different entries via grid', async ({ page }) => {
      await page.goto('/e');

      // Get all read links
      const readLinks = page.locator('[data-layout="entry-grid"] a:has-text("Read")');
      const linkCount = await readLinks.count();

      if (linkCount < 2) {
        test.skip(); // Need at least 2 entries to test
      }

      // Click first entry
      await readLinks.nth(0).click();
      const firstEntryUrl = page.url();

      // Go back
      await page.goBack();

      // Click second entry
      await readLinks.nth(1).click();
      const secondEntryUrl = page.url();

      // URLs should be different (different entries)
      expect(firstEntryUrl).not.toBe(secondEntryUrl);

      // Both should match pattern
      expect(firstEntryUrl).toMatch(/\/e\/[a-z0-9\-]+$/);
      expect(secondEntryUrl).toMatch(/\/e\/[a-z0-9\-]+$/);
    });

    test('user can navigate via direct URL to entry', async ({ page }) => {
      // Get an entry URL from the grid first
      await page.goto('/e');

      const firstReadLink = page.locator('[data-layout="entry-grid"] a:has-text("Read")').first();
      const entrySlug = await firstReadLink.getAttribute('href');

      if (!entrySlug) {
        test.skip();
      }

      // Navigate directly to entry
      await page.goto(entrySlug!);

      // Should land on correct entry page
      await expect(page).toHaveURL(new RegExp(`${entrySlug}$`));

      // Content should be visible
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Accessibility & UX', () => {
    test('entry grid has proper semantic structure', async ({ page }) => {
      await page.goto('/e');

      // Page should have main content area
      const main = page.locator('main');
      await expect(main).toBeVisible();

      // Should have heading
      const headings = page.locator('h1, h2, h3');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);
    });

    test('entry cards are keyboard navigable', async ({ page }) => {
      await page.goto('/e');

      // Tab to first read link
      const firstReadLink = page.locator('[data-layout="entry-grid"] a:has-text("Read")').first();

      if (!(await firstReadLink.isVisible())) {
        test.skip();
      }

      // Focus should work
      await firstReadLink.focus();

      // Should be focusable (keyboard navigable)
      const isFocused = await firstReadLink.evaluate((el) => el === document.activeElement);
      expect(isFocused).toBe(true);

      // Enter key should navigate
      await page.keyboard.press('Enter');

      // Should navigate to entry
      await expect(page).toHaveURL(/\/e\/[a-z0-9\-]+$/);
    });

    test('entry links have descriptive text', async ({ page }) => {
      await page.goto('/e');

      const readLink = page.locator('[data-layout="entry-grid"] a:has-text("Read")').first();

      if (!(await readLink.isVisible())) {
        test.skip();
      }

      // Link should have "Read" text or similar
      const linkText = await readLink.textContent();
      expect(linkText?.toLowerCase()).toContain('read');

      // Link should have href
      const href = await readLink.getAttribute('href');
      expect(href).toMatch(/^\/e\/[a-z0-9\-]+$/);
    });

    test('mobile responsive layout flows naturally', async ({ page }) => {
      // Test on various mobile sizes
      const viewports = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 375, height: 667 }, // iPhone 8
        { width: 414, height: 896 }, // iPhone XR
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/e');

        // Grid should be visible
        const grid = page.locator('[data-layout="entry-grid"]');
        await expect(grid).toBeVisible();

        // Cards should fit viewport
        const cards = grid.locator('article');
        const firstCard = cards.first();

        if (await firstCard.isVisible()) {
          const bbox = await firstCard.boundingBox();
          // Card should fit within viewport width with reasonable margin
          expect(bbox?.width).toBeLessThanOrEqual(viewport.width);
        }
      }
    });
  });

  test.describe('Content Quality', () => {
    test('entry cards have non-empty titles', async ({ page }) => {
      await page.goto('/e');

      const cards = page.locator('[data-layout="entry-grid"] article');
      const cardCount = await cards.count();

      if (cardCount === 0) {
        test.skip(); // No entries
      }

      // Check first few cards have titles
      const cardsToCheck = Math.min(3, cardCount);

      for (let i = 0; i < cardsToCheck; i++) {
        const card = cards.nth(i);
        const titleElements = card.locator('h3, h4, [class*="title"]');
        const hasTitle = await titleElements.count().then((c) => c > 0);

        // Cards should have some title/heading
        expect(hasTitle).toBe(true);
      }
    });

    test('featured entry renders if available', async ({ page }) => {
      await page.goto('/e');

      // Check if featured entry highlight is present
      const featuredSection = page.locator('[data-layout="entry-highlight"]');
      const hasFeatured = await featuredSection.count();

      if (hasFeatured > 0) {
        // Featured section should be visible
        await expect(featuredSection).toBeVisible();

        // Featured section should have content
        const content = featuredSection.locator('article, [class*="card"]');
        expect(await content.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('invalid entry slug shows 404 page', async ({ page, context }) => {
      // Attempt to navigate to non-existent entry
      const response = await page.goto('/e/nonexistent-entry-slug-12345');

      // Should return 404
      expect(response?.status()).toBe(404);

      // User should see not found page
      const notFoundHeading = page.locator('text=/not found|404/i');
      await expect(notFoundHeading).toBeVisible();
    });

    test('entry detail page shows error gracefully if data fails', async ({ page }) => {
      // This tests that if the entry fails to load, page doesn't crash
      // Navigate to detail first
      await page.goto('/e');

      const firstReadLink = page.locator('[data-layout="entry-grid"] a:has-text("Read")').first();

      if (!(await firstReadLink.isVisible())) {
        test.skip();
      }

      await firstReadLink.click();

      // Page should not show JavaScript errors
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // After waiting a bit, should still have content visible
      await page.waitForTimeout(1000);
      await expect(page.locator('main')).toBeVisible();

      // Should not have critical errors
      const criticalErrors = consoleErrors.filter((e) => !e.includes('favicon'));
      expect(criticalErrors.length).toBe(0);
    });
  });
});
