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

  test.describe('Wiki-links', () => {
    test('resolved wiki-links render as internal links', async ({ page }) => {
      // The "age-of-abundance" article links to [[Energy Abundance]] and
      // [[Coordination Abundance]] via wiki-link syntax in the body text.
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const body = page.locator('.wiki-article__body');
      await expect(body).toBeVisible();

      // Resolved links render as <a class="wiki-link" href="/a/...">
      const wikiLinks = body.locator('a.wiki-link');
      expect(await wikiLinks.count()).toBeGreaterThan(0);

      // Check one specific resolved link: [[Energy Abundance]]
      const energyLink = body.locator('a.wiki-link[href="/a/energy-abundance"]');
      await expect(energyLink).toBeVisible();
      await expect(energyLink).toContainText('Energy Abundance');
    });

    test('aliased wiki-links render with display text', async ({ page }) => {
      // [[Coordination Abundance|coordination]] in age-of-abundance lede
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const lede = page.locator('.wiki-article__lede');
      const aliasedLink = lede.locator('a.wiki-link[href="/a/coordination-abundance"]');
      await expect(aliasedLink).toBeVisible();
      await expect(aliasedLink).toContainText('coordination');
    });

    test('broken wiki-links render with broken visual state', async ({ page }) => {
      // [[Governance Protocols|protocols]] in age-of-abundance is broken
      // (no article with slug "governance-protocols" exists).
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const body = page.locator('.wiki-article__body');
      const brokenLink = body.locator('.wiki-link--broken');
      await expect(brokenLink.first()).toBeVisible();
      await expect(brokenLink.first()).toContainText('protocols');

      // Broken links have a title tooltip explaining the issue
      await expect(brokenLink.first()).toHaveAttribute(
        'title',
        /page not found/i,
      );

      // Broken links are aria-disabled
      await expect(brokenLink.first()).toHaveAttribute('aria-disabled', 'true');
    });

    test('wiki-link navigates to correct article on click', async ({ page }) => {
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const body = page.locator('.wiki-article__body');
      const energyLink = body.locator('a.wiki-link[href="/a/energy-abundance"]');
      await energyLink.click();

      await page.waitForURL(`${WIKI}/a/energy-abundance`);
      await expect(
        page.getByRole('heading', { level: 1, name: /energy abundance/i }),
      ).toBeVisible();
    });

    test('articles with wiki-links still show correct word count and reading time', async ({ page }) => {
      // Verify that wiki-link syntax doesn't inflate word count
      // (the raw [[...]] brackets should be stripped by deriveWikiMeta)
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const metaList = page.locator('.wiki-article__meta');
      await expect(metaList).toContainText(/\d+\s*min/);

      const wordCountEl = metaList.locator('.wiki-article__word-count');
      const text = (await wordCountEl.textContent()) ?? '';
      const count = Number(text.replace(/,/g, ''));
      expect(count).toBeGreaterThan(100);
    });
  });

  test.describe('Table of contents', () => {
    test('TOC renders as a nav landmark with correct entries', async ({ page }) => {
      await page.goto(`${WIKI}/a/age-of-abundance`);

      // TOC is a <nav> with the correct aria-label
      const tocNav = page.getByRole('navigation', { name: /table of contents/i });
      await expect(tocNav).toBeVisible();

      // TOC contains an ordered list of links matching the article h2 headings
      const tocLinks = tocNav.locator('.wiki-toc__link');
      const expectedHeadings = [
        'Origins of the term',
        'Core pillars',
        'Critiques and open questions',
      ];
      expect(await tocLinks.count()).toBe(expectedHeadings.length);

      for (let i = 0; i < expectedHeadings.length; i++) {
        await expect(tocLinks.nth(i)).toContainText(expectedHeadings[i]);
      }
    });

    test('TOC links point to anchored headings with matching IDs', async ({ page }) => {
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const tocNav = page.getByRole('navigation', { name: /table of contents/i });
      const tocLinks = tocNav.locator('.wiki-toc__link');
      const count = await tocLinks.count();
      expect(count).toBeGreaterThan(0);

      // Each TOC link's href fragment matches an h2 id in the article body
      for (let i = 0; i < count; i++) {
        const href = await tocLinks.nth(i).getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/^#/);

        const targetId = href!.slice(1);
        const targetH2 = page.locator(`.wiki-article__h2[id="${targetId}"]`);
        await expect(targetH2).toBeVisible();
      }
    });

    test('clicking a TOC link navigates to the heading', async ({ page }) => {
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const tocNav = page.getByRole('navigation', { name: /table of contents/i });
      const secondLink = tocNav.locator('.wiki-toc__link').nth(1);
      const href = await secondLink.getAttribute('href');
      expect(href).toBeTruthy();

      await secondLink.click();

      // URL fragment updates
      await expect(page).toHaveURL(new RegExp(`#${href!.slice(1)}$`));
    });

    test('TOC is inside a collapsible details element', async ({ page }) => {
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const details = page.locator('.wiki-toc__details');
      await expect(details).toBeVisible();

      // Starts open
      await expect(details).toHaveAttribute('open', '');

      // Summary toggle is present and accessible
      const summary = details.locator('.wiki-toc__toggle');
      await expect(summary).toBeVisible();
      await expect(summary).toContainText(/contents/i);
    });

    test('article headings have scroll-margin for anchor offset', async ({ page }) => {
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const h2WithId = page.locator('.wiki-article__h2[id]').first();
      await expect(h2WithId).toBeVisible();

      const scrollMargin = await h2WithId.evaluate(
        (el) => getComputedStyle(el).scrollMarginTop,
      );
      // Should have some scroll margin (1.5rem = 24px at default font size)
      expect(parseFloat(scrollMargin)).toBeGreaterThan(0);
    });
  });

  test.describe('Backlinks panel', () => {
    test('article with backlinks shows the backlinks section', async ({ page }) => {
      // age-of-abundance is linked to by energy-abundance and coordination-abundance
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const backlinksSection = page.locator('.wiki-backlinks');
      await expect(backlinksSection).toBeVisible();

      // Section has the correct heading
      const heading = backlinksSection.getByRole('heading', { level: 2 });
      await expect(heading).toContainText(/pages that link here/i);

      // Contains a list of backlinks
      const items = backlinksSection.locator('.wiki-backlinks__item');
      expect(await items.count()).toBeGreaterThanOrEqual(2);
    });

    test('backlink items show title and summary', async ({ page }) => {
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const backlinksSection = page.locator('.wiki-backlinks');
      const firstItem = backlinksSection.locator('.wiki-backlinks__item').first();

      // Title is visible
      const title = firstItem.locator('.wiki-backlinks__title');
      await expect(title).toBeVisible();
      const titleText = await title.textContent();
      expect(titleText!.length).toBeGreaterThan(0);

      // Summary is visible
      const summary = firstItem.locator('.wiki-backlinks__summary');
      await expect(summary).toBeVisible();
    });

    test('backlink items are clickable links to the source article', async ({ page }) => {
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const backlinksSection = page.locator('.wiki-backlinks');
      // Find the link to energy-abundance
      const energyLink = backlinksSection.locator('a.wiki-backlinks__link[href="/a/energy-abundance"]');
      await expect(energyLink).toBeVisible();

      await energyLink.click();
      await page.waitForURL(`${WIKI}/a/energy-abundance`);
      await expect(
        page.getByRole('heading', { level: 1, name: /energy abundance/i }),
      ).toBeVisible();
    });

    test('backlinks section has accessible landmark structure', async ({ page }) => {
      await page.goto(`${WIKI}/a/age-of-abundance`);

      // The section is labelled by its heading
      const section = page.locator('section[aria-labelledby="backlinks-heading"]');
      await expect(section).toBeVisible();

      // The heading ID matches
      const heading = page.locator('#backlinks-heading');
      await expect(heading).toBeVisible();

      // Backlinks are in a list for SR "list of N items" announcement
      const list = section.locator('ul.wiki-backlinks__list');
      await expect(list).toBeVisible();
    });

    test('backlinks panel has 44px minimum touch targets', async ({ page }) => {
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const firstLink = page.locator('.wiki-backlinks__link').first();
      await expect(firstLink).toBeVisible();

      const box = await firstLink.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });
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

  test.describe('Tag pages (/t/[tag])', () => {
    test('tag page renders with correct heading, count, and articles', async ({ page }) => {
      await page.goto(`${WIKI}/t/governance`);

      // Breadcrumb is present with three levels
      const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
      await expect(breadcrumb).toBeVisible();
      await expect(breadcrumb).toContainText('All articles');

      // Page heading is the tag name
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toBeVisible();
      await expect(h1).toContainText('governance');

      // Lede shows article count and tag name
      const lede = page.locator('.wiki-index__lede');
      await expect(lede).toContainText(/articles?\s+tagged/);
      await expect(lede).toContainText('governance');

      // Article cards are rendered — governance tag appears on both
      // "age-of-abundance" and "coordination-abundance"
      const cards = page.locator('.article-card');
      expect(await cards.count()).toBe(2);
    });

    test('tag page shows all-tags navigation with current tag highlighted', async ({ page }) => {
      await page.goto(`${WIKI}/t/governance`);

      const tagNav = page.getByRole('navigation', { name: /browse other tags/i });
      await expect(tagNav).toBeVisible();

      // Multiple tag chips are rendered
      const chips = tagNav.locator('.wiki-tag-page__tag-chip');
      expect(await chips.count()).toBeGreaterThan(2);

      // The current tag has aria-current="page"
      const currentChip = tagNav.locator('.wiki-tag-page__tag-chip[aria-current="page"]');
      await expect(currentChip).toBeVisible();
      await expect(currentChip).toContainText('governance');
    });

    test('clicking a different tag chip navigates to that tag page', async ({ page }) => {
      await page.goto(`${WIKI}/t/governance`);

      const tagNav = page.getByRole('navigation', { name: /browse other tags/i });
      // Find a tag chip that is NOT the current one (no aria-current)
      const otherChip = tagNav.locator('.wiki-tag-page__tag-chip:not([aria-current])').first();
      const tagText = (await otherChip.textContent()) ?? '';
      await otherChip.click();

      await page.waitForURL(new RegExp(`${WIKI}/t/${tagText}`));
      await expect(
        page.getByRole('heading', { level: 1, name: tagText }),
      ).toBeVisible();
    });

    test('article tag chips link to tag pages', async ({ page }) => {
      // Tags in the article header should now be links to /t/[tag]
      await page.goto(`${WIKI}/a/age-of-abundance`);

      const tagList = page.locator('.wiki-article__tags');
      await expect(tagList).toBeVisible();

      const tagLinks = tagList.locator('a.wiki-article__tag');
      expect(await tagLinks.count()).toBeGreaterThan(0);

      // First tag chip is a link to the correct tag page
      const firstTag = tagLinks.first();
      const href = await firstTag.getAttribute('href');
      expect(href).toMatch(/^\/t\//);

      // Click it to navigate
      await firstTag.click();
      await page.waitForURL(new RegExp(`${WIKI}/t/`));
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('tag page has 44px minimum touch targets on tag chips', async ({ page }) => {
      await page.goto(`${WIKI}/t/governance`);

      const tagNav = page.getByRole('navigation', { name: /browse other tags/i });
      const firstChip = tagNav.locator('.wiki-tag-page__tag-chip').first();
      await expect(firstChip).toBeVisible();

      const box = await firstChip.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe('Full-text search', () => {
    test('search trigger button is visible in site header', async ({ page }) => {
      await page.goto(`${WIKI}/`);

      const trigger = page.locator('.wiki-search__trigger');
      await expect(trigger).toBeVisible();
      await expect(trigger).toHaveAttribute('aria-label', 'Search articles');
    });

    test('clicking trigger opens search dialog with combobox input', async ({ page }) => {
      await page.goto(`${WIKI}/`);

      const trigger = page.locator('.wiki-search__trigger');
      await trigger.click();

      // Dialog is visible
      const dialog = page.locator('.wiki-search__dialog');
      await expect(dialog).toBeVisible();

      // Combobox input is focused
      const input = dialog.locator('input[role="combobox"]');
      await expect(input).toBeVisible();
      await expect(input).toBeFocused();
      await expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    test('typing a query shows matching results in listbox', async ({ page }) => {
      await page.goto(`${WIKI}/`);

      const trigger = page.locator('.wiki-search__trigger');
      await trigger.click();

      const input = page.locator('.wiki-search__input');
      await input.fill('energy');

      // Results appear in a listbox
      const listbox = page.locator('[role="listbox"]');
      await expect(listbox).toBeVisible();

      const options = listbox.locator('[role="option"]');
      expect(await options.count()).toBeGreaterThan(0);

      // The top result should be Energy Abundance (title match)
      const firstTitle = options.first().locator('.wiki-search__option-title');
      await expect(firstTitle).toContainText('Energy Abundance');

      // Live region announces result count
      const live = page.locator('[aria-live="polite"]').last();
      await expect(live).toContainText(/\d+ result/);
    });

    test('keyboard navigation: arrow keys move active descendant, Enter navigates', async ({ page }) => {
      await page.goto(`${WIKI}/`);

      const trigger = page.locator('.wiki-search__trigger');
      await trigger.click();

      const input = page.locator('.wiki-search__input');
      await input.fill('abundance');

      // Wait for results
      const options = page.locator('[role="option"]');
      await expect(options.first()).toBeVisible();

      // Arrow down to first result
      await input.press('ArrowDown');
      const firstOption = options.first();
      await expect(firstOption).toHaveAttribute('aria-selected', 'true');
      await expect(firstOption).toHaveClass(/wiki-search__option--active/);

      // Arrow down to second result
      await input.press('ArrowDown');
      const secondOption = options.nth(1);
      await expect(secondOption).toHaveAttribute('aria-selected', 'true');
      await expect(firstOption).toHaveAttribute('aria-selected', 'false');

      // Enter navigates to the selected article
      const slug = await secondOption.locator('.wiki-search__option-title').textContent();
      await input.press('Enter');
      await page.waitForURL(new RegExp(`${WIKI}/a/.+`));
    });

    test('Escape key closes the search dialog', async ({ page }) => {
      await page.goto(`${WIKI}/`);

      const trigger = page.locator('.wiki-search__trigger');
      await trigger.click();

      const dialog = page.locator('.wiki-search__dialog');
      await expect(dialog).toBeVisible();

      const input = page.locator('.wiki-search__input');
      await input.press('Escape');

      await expect(dialog).not.toBeVisible();
    });

    test('non-matching query shows empty state', async ({ page }) => {
      await page.goto(`${WIKI}/`);

      const trigger = page.locator('.wiki-search__trigger');
      await trigger.click();

      const input = page.locator('.wiki-search__input');
      await input.fill('xyzzyplugh');

      const empty = page.locator('.wiki-search__empty');
      await expect(empty).toBeVisible();
      await expect(empty).toContainText(/no articles match/i);

      // Live region announces "No articles found"
      const live = page.locator('.wiki-search__live');
      await expect(live).toContainText(/no articles found/i);
    });

    test('search trigger has 44px minimum touch target', async ({ page }) => {
      await page.goto(`${WIKI}/`);

      const trigger = page.locator('.wiki-search__trigger');
      await expect(trigger).toBeVisible();

      const box = await trigger.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });

    test('site header is visible on all pages', async ({ page }) => {
      // Header with logo and search on home
      await page.goto(`${WIKI}/`);
      const header = page.locator('.wiki-site-header');
      await expect(header).toBeVisible();

      const logo = page.locator('.wiki-site-header__logo');
      await expect(logo).toContainText('ageofabundance.wiki');

      // Also on article page
      await page.goto(`${WIKI}/a/age-of-abundance`);
      await expect(header).toBeVisible();
    });
  });
});
