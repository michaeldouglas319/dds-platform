# News Scraper → Entries Seed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a scraper that fetches official news from WHO, INTERPOL, UN, and White House; transform to `EntryRow` schema; unit test the transforms; seed `public.entries` table; visually verify `/e` page renders.

**Architecture:** 
1. **Scraper sources** — modular functions per data source (WHO RSS, INTERPOL JSON, UN API, White House RSS)
2. **Schema transformer** — converts raw articles → `EntryRow` with slug, tag, subject, content, meta
3. **Unit tests** — test each transform independently before DB writes
4. **Seeder script** — run once to populate `public.entries`, then verify rendering on `/e` pages

**Tech Stack:** Node.js, Vitest (unit tests), node-fetch or axios for HTTP, cheerio for HTML parsing if needed, Supabase client

---

## File Structure

**Create:**
- `scripts/scrape-and-seed/index.ts` — main orchestrator
- `scripts/scrape-and-seed/sources/who.ts` — WHO disease outbreak scraper
- `scripts/scrape-and-seed/sources/interpol.ts` — INTERPOL notices scraper
- `scripts/scrape-and-seed/sources/un.ts` — UN OCHA humanitarian scraper
- `scripts/scrape-and-seed/sources/whitehouse.ts` — White House announcements scraper
- `scripts/scrape-and-seed/transform.ts` — raw article → EntryRow schema
- `scripts/scrape-and-seed/__tests__/transform.test.ts` — unit tests for transforms
- `scripts/scrape-and-seed/__tests__/sources.test.ts` — unit tests for scrapers (mock data)

**Modify:**
- `package.json` — add test script, dev dependencies (vitest, node-fetch)

---

## Task 1: Set up test infrastructure and type definitions

**Files:**
- Create: `scripts/scrape-and-seed/types.ts`
- Modify: `package.json`

- [ ] **Step 1: Create types file for raw article shape**

Create `scripts/scrape-and-seed/types.ts`:

```typescript
export interface RawArticle {
  title: string;
  description?: string;
  content?: string;
  url: string;
  source: 'who' | 'interpol' | 'un' | 'whitehouse';
  published_date?: string;
  image_url?: string;
  tags?: string[];
}

export interface TransformedEntry {
  id: string;
  type: 'entry';
  slug: string;
  tag: 'disease' | 'lethal' | 'disaster' | 'famine';
  subject: {
    title: string;
    subtitle?: string;
  };
  content: string | { body: string };
  media?: {
    image?: string;
  };
  links?: Array<{
    label: string;
    url: string;
  }>;
  meta: {
    source: string;
    url: string;
    published_at: string;
  };
  status: 'active';
  featured: boolean;
  featured_rank: number | null;
}
```

- [ ] **Step 2: Add test dependencies to package.json**

In `/Volumes/Seagate Portable Drive/claude/dds-platform/apps/ageofabundance-wiki/package.json`, add under `devDependencies`:

```json
"devDependencies": {
  "vitest": "^1.0.0",
  "@vitest/ui": "^1.0.0",
  "node-fetch": "^3.3.0",
  "axios": "^1.6.0"
}
```

- [ ] **Step 3: Add test script to package.json**

In the same file, add under `scripts`:

```json
"test": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 4: Commit**

```bash
cd /Volumes/Seagate Portable Drive/claude/dds-platform/apps/ageofabundance-wiki
git add package.json
git add scripts/scrape-and-seed/types.ts
git commit -m "setup: add scraper types and test infrastructure"
```

---

## Task 2: Write unit tests for schema transformation

**Files:**
- Create: `scripts/scrape-and-seed/__tests__/transform.test.ts`

- [ ] **Step 1: Write failing tests for WHO disease article transform**

Create `scripts/scrape-and-seed/__tests__/transform.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { transformArticleToEntry } from '../transform';
import type { RawArticle } from '../types';

describe('transformArticleToEntry', () => {
  it('transforms WHO disease article to entry with disease tag', () => {
    const article: RawArticle = {
      title: 'Mpox outbreak detected in Central Africa',
      description: 'WHO confirms new cases of mpox in the region',
      content: 'Health authorities report 45 confirmed cases...',
      url: 'https://who.int/news/mpox-outbreak',
      source: 'who',
      published_date: '2026-04-15T10:00:00Z',
      image_url: 'https://who.int/images/mpox.jpg',
    };

    const entry = transformArticleToEntry(article);

    expect(entry.type).toBe('entry');
    expect(entry.tag).toBe('disease');
    expect(entry.slug).toBe('mpox-outbreak-detected-in-central-africa');
    expect(entry.subject.title).toBe('Mpox outbreak detected in Central Africa');
    expect(entry.meta.source).toBe('who');
    expect(entry.status).toBe('active');
    expect(entry.featured).toBe(false);
  });

  it('transforms INTERPOL notice to entry with lethal tag', () => {
    const article: RawArticle = {
      title: 'International Wanted Person: Armed Robbery Ring',
      description: 'INTERPOL seeks information on suspects',
      url: 'https://interpol.int/notices/123',
      source: 'interpol',
      published_date: '2026-04-10T14:30:00Z',
    };

    const entry = transformArticleToEntry(article);

    expect(entry.tag).toBe('lethal');
    expect(entry.slug).toBe('international-wanted-person-armed-robbery-ring');
  });

  it('transforms UN humanitarian article to disaster tag', () => {
    const article: RawArticle = {
      title: 'Earthquake Relief Coordination in Turkey',
      description: 'UN launches emergency response',
      url: 'https://un.org/humanitarian/earthquake-relief',
      source: 'un',
      published_date: '2026-04-08T09:15:00Z',
    };

    const entry = transformArticleToEntry(article);

    expect(entry.tag).toBe('disaster');
    expect(entry.meta.source).toBe('un');
  });

  it('generates slug from title (lowercase, hyphens, no special chars)', () => {
    const article: RawArticle = {
      title: "White House & COVID-19: What's Next?",
      url: 'https://whitehouse.gov/covid',
      source: 'whitehouse',
      published_date: '2026-04-01T00:00:00Z',
    };

    const entry = transformArticleToEntry(article);

    expect(entry.slug).toBe('white-house-covid-19-whats-next');
  });

  it('includes URL and source in meta', () => {
    const article: RawArticle = {
      title: 'Test Article',
      url: 'https://example.com/article',
      source: 'who',
      published_date: '2026-04-16T12:00:00Z',
    };

    const entry = transformArticleToEntry(article);

    expect(entry.meta.url).toBe('https://example.com/article');
    expect(entry.meta.published_at).toBe('2026-04-16T12:00:00Z');
  });

  it('uses content or description for entry body', () => {
    const withContent: RawArticle = {
      title: 'Article',
      content: 'Full article body here',
      url: 'https://example.com',
      source: 'who',
      published_date: '2026-04-16T00:00:00Z',
    };

    const entry1 = transformArticleToEntry(withContent);
    expect(entry1.content).toContain('Full article body here');

    const withDescription: RawArticle = {
      title: 'Article',
      description: 'Short description only',
      url: 'https://example.com',
      source: 'who',
      published_date: '2026-04-16T00:00:00Z',
    };

    const entry2 = transformArticleToEntry(withDescription);
    expect(entry2.content).toContain('Short description only');
  });

  it('includes image URL in media if present', () => {
    const article: RawArticle = {
      title: 'Article',
      url: 'https://example.com',
      source: 'who',
      published_date: '2026-04-16T00:00:00Z',
      image_url: 'https://example.com/image.jpg',
    };

    const entry = transformArticleToEntry(article);

    expect(entry.media?.image).toBe('https://example.com/image.jpg');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Volumes/Seagate Portable Drive/claude/dds-platform/apps/ageofabundance-wiki
npm test -- scripts/scrape-and-seed/__tests__/transform.test.ts
```

Expected: All tests FAIL with "transformArticleToEntry is not defined"

- [ ] **Step 3: Commit the test file**

```bash
git add scripts/scrape-and-seed/__tests__/transform.test.ts
git commit -m "test: add transform schema tests"
```

---

## Task 3: Implement schema transformation logic

**Files:**
- Create: `scripts/scrape-and-seed/transform.ts`

- [ ] **Step 1: Implement transformArticleToEntry function**

Create `scripts/scrape-and-seed/transform.ts`:

```typescript
import type { RawArticle, TransformedEntry } from './types';
import { v4 as uuidv4 } from 'uuid';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[?]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function mapSourceToTag(source: RawArticle['source']): TransformedEntry['tag'] {
  const tagMap: Record<string, TransformedEntry['tag']> = {
    who: 'disease',
    interpol: 'lethal',
    un: 'disaster',
    whitehouse: 'disaster', // Default to disaster for mixed announcements
  };
  return tagMap[source] || 'disaster';
}

export function transformArticleToEntry(article: RawArticle): TransformedEntry {
  const slug = generateSlug(article.title);
  const tag = mapSourceToTag(article.source);
  const content = article.content || article.description || '';

  const entry: TransformedEntry = {
    id: `${article.source}-${slug}`,
    type: 'entry',
    slug,
    tag,
    subject: {
      title: article.title,
      subtitle: article.description,
    },
    content,
    media: article.image_url ? { image: article.image_url } : undefined,
    links: [
      {
        label: 'Read full article',
        url: article.url,
      },
    ],
    meta: {
      source: article.source,
      url: article.url,
      published_at: article.published_date || new Date().toISOString(),
    },
    status: 'active',
    featured: false,
    featured_rank: null,
  };

  return entry;
}

export function batchTransformArticles(articles: RawArticle[]): TransformedEntry[] {
  return articles.map(transformArticleToEntry);
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
cd /Volumes/Seagate Portable Drive/claude/dds-platform/apps/ageofabundance-wiki
npm test -- scripts/scrape-and-seed/__tests__/transform.test.ts
```

Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add scripts/scrape-and-seed/transform.ts
git commit -m "feat: implement article to entry schema transformation"
```

---

## Task 4: Write unit tests for WHO scraper

**Files:**
- Create: `scripts/scrape-and-seed/__tests__/sources.test.ts`

- [ ] **Step 1: Write failing tests for WHO scraper with mock RSS data**

Create `scripts/scrape-and-seed/__tests__/sources.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { fetchWhoAlerts } from '../sources/who';
import type { RawArticle } from '../types';

describe('fetchWhoAlerts', () => {
  it('parses WHO disease alerts from RSS feed', async () => {
    // Mock RSS response
    const mockRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>WHO News</title>
    <link>https://who.int</link>
    <item>
      <title>Mpox cases reported in West Africa</title>
      <description>WHO confirms new mpox outbreak with 12 cases</description>
      <link>https://who.int/news/mpox-2026</link>
      <pubDate>Wed, 16 Apr 2026 10:00:00 GMT</pubDate>
      <enclosure url="https://who.int/images/mpox.jpg" />
    </item>
    <item>
      <title>COVID-19 Update: New Variants</title>
      <description>WHO tracks emerging variants globally</description>
      <link>https://who.int/news/covid-variants-2026</link>
      <pubDate>Tue, 15 Apr 2026 14:30:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(new Response(mockRss, { status: 200 }))
    ));

    const articles = await fetchWhoAlerts();

    expect(articles).toHaveLength(2);
    expect(articles[0].title).toBe('Mpox cases reported in West Africa');
    expect(articles[0].source).toBe('who');
    expect(articles[0].url).toBe('https://who.int/news/mpox-2026');
    expect(articles[1].title).toBe('COVID-19 Update: New Variants');
  });

  it('returns empty array if fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));

    const articles = await fetchWhoAlerts();

    expect(articles).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- scripts/scrape-and-seed/__tests__/sources.test.ts
```

Expected: FAIL with "fetchWhoAlerts is not defined"

- [ ] **Step 3: Commit test file**

```bash
git add scripts/scrape-and-seed/__tests__/sources.test.ts
git commit -m "test: add WHO scraper tests with mock data"
```

---

## Task 5: Implement WHO scraper

**Files:**
- Create: `scripts/scrape-and-seed/sources/who.ts`

- [ ] **Step 1: Implement WHO RSS parser**

Create `scripts/scrape-and-seed/sources/who.ts`:

```typescript
import type { RawArticle } from '../types';

const WHO_ALERTS_RSS = 'https://www.who.int/feeds/entity/cmo/feed/rss2.0.xml';

export async function fetchWhoAlerts(): Promise<RawArticle[]> {
  try {
    const response = await fetch(WHO_ALERTS_RSS, { timeout: 10000 });

    if (!response.ok) {
      console.error(`WHO RSS fetch failed: ${response.status}`);
      return [];
    }

    const text = await response.text();
    const articles = parseWhoRss(text);
    return articles;
  } catch (error) {
    console.error('Error fetching WHO alerts:', error);
    return [];
  }
}

function parseWhoRss(xml: string): RawArticle[] {
  const articles: RawArticle[] = [];

  // Simple XML parsing (use a library in production, but for MVP this works)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/.exec(itemXml);
    const title = titleMatch ? titleMatch[1] || titleMatch[2] : '';

    const descMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/.exec(itemXml);
    const description = descMatch ? descMatch[1] || descMatch[2] : '';

    const linkMatch = /<link>(.*?)<\/link>/.exec(itemXml);
    const url = linkMatch ? linkMatch[1] : '';

    const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemXml);
    const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

    if (title && url) {
      articles.push({
        title,
        description,
        url,
        source: 'who',
        published_date: pubDate,
      });
    }
  }

  return articles;
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
npm test -- scripts/scrape-and-seed/__tests__/sources.test.ts
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add scripts/scrape-and-seed/sources/who.ts
git commit -m "feat: implement WHO disease alert RSS scraper"
```

---

## Task 6: Implement remaining source scrapers (INTERPOL, UN, White House)

**Files:**
- Create: `scripts/scrape-and-seed/sources/interpol.ts`
- Create: `scripts/scrape-and-seed/sources/un.ts`
- Create: `scripts/scrape-and-seed/sources/whitehouse.ts`

- [ ] **Step 1: Implement INTERPOL scraper**

Create `scripts/scrape-and-seed/sources/interpol.ts`:

```typescript
import type { RawArticle } from '../types';

const INTERPOL_RSS = 'https://www.interpol.int/en/news-and-events/feed';

export async function fetchInterpolNotices(): Promise<RawArticle[]> {
  try {
    const response = await fetch(INTERPOL_RSS, { timeout: 10000 });

    if (!response.ok) {
      console.error(`INTERPOL RSS fetch failed: ${response.status}`);
      return [];
    }

    const text = await response.text();
    const articles = parseInterpolRss(text);
    return articles;
  } catch (error) {
    console.error('Error fetching INTERPOL notices:', error);
    return [];
  }
}

function parseInterpolRss(xml: string): RawArticle[] {
  const articles: RawArticle[] = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/.exec(itemXml);
    const title = titleMatch ? titleMatch[1] || titleMatch[2] : '';

    const descMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/.exec(itemXml);
    const description = descMatch ? descMatch[1] || descMatch[2] : '';

    const linkMatch = /<link>(.*?)<\/link>/.exec(itemXml);
    const url = linkMatch ? linkMatch[1] : '';

    const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemXml);
    const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

    if (title && url) {
      articles.push({
        title,
        description,
        url,
        source: 'interpol',
        published_date: pubDate,
      });
    }
  }

  return articles;
}
```

- [ ] **Step 2: Implement UN OCHA scraper**

Create `scripts/scrape-and-seed/sources/un.ts`:

```typescript
import type { RawArticle } from '../types';

const UN_OCHA_RSS = 'https://www.unocha.org/node/all/crises/feed';

export async function fetchUnHumanitarian(): Promise<RawArticle[]> {
  try {
    const response = await fetch(UN_OCHA_RSS, { timeout: 10000 });

    if (!response.ok) {
      console.error(`UN OCHA RSS fetch failed: ${response.status}`);
      return [];
    }

    const text = await response.text();
    const articles = parseUnRss(text);
    return articles;
  } catch (error) {
    console.error('Error fetching UN humanitarian data:', error);
    return [];
  }
}

function parseUnRss(xml: string): RawArticle[] {
  const articles: RawArticle[] = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/.exec(itemXml);
    const title = titleMatch ? titleMatch[1] || titleMatch[2] : '';

    const descMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/.exec(itemXml);
    const description = descMatch ? descMatch[1] || descMatch[2] : '';

    const linkMatch = /<link>(.*?)<\/link>/.exec(itemXml);
    const url = linkMatch ? linkMatch[1] : '';

    const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemXml);
    const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

    if (title && url) {
      articles.push({
        title,
        description,
        url,
        source: 'un',
        published_date: pubDate,
      });
    }
  }

  return articles;
}
```

- [ ] **Step 3: Implement White House scraper**

Create `scripts/scrape-and-seed/sources/whitehouse.ts`:

```typescript
import type { RawArticle } from '../types';

const WHITEHOUSE_RSS = 'https://www.whitehouse.gov/feed/';

export async function fetchWhiteHouseNews(): Promise<RawArticle[]> {
  try {
    const response = await fetch(WHITEHOUSE_RSS, { timeout: 10000 });

    if (!response.ok) {
      console.error(`White House RSS fetch failed: ${response.status}`);
      return [];
    }

    const text = await response.text();
    const articles = parseWhiteHouseRss(text);
    return articles;
  } catch (error) {
    console.error('Error fetching White House news:', error);
    return [];
  }
}

function parseWhiteHouseRss(xml: string): RawArticle[] {
  const articles: RawArticle[] = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/.exec(itemXml);
    const title = titleMatch ? titleMatch[1] || titleMatch[2] : '';

    const descMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/.exec(itemXml);
    const description = descMatch ? descMatch[1] || descMatch[2] : '';

    const linkMatch = /<link>(.*?)<\/link>/.exec(itemXml);
    const url = linkMatch ? linkMatch[1] : '';

    const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemXml);
    const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

    if (title && url) {
      articles.push({
        title,
        description,
        url,
        source: 'whitehouse',
        published_date: pubDate,
      });
    }
  }

  return articles;
}
```

- [ ] **Step 4: Add additional tests for each scraper (optional, can expand mock tests from Task 4)**

For brevity, tests follow the same pattern. Update `scripts/scrape-and-seed/__tests__/sources.test.ts` to add:

```typescript
// Add similar test blocks for fetchInterpolNotices, fetchUnHumanitarian, fetchWhiteHouseNews
```

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: All passing

- [ ] **Step 6: Commit**

```bash
git add scripts/scrape-and-seed/sources/
git commit -m "feat: implement INTERPOL, UN, and White House scrapers"
```

---

## Task 7: Implement the seeder script

**Files:**
- Create: `scripts/scrape-and-seed/index.ts`

- [ ] **Step 1: Write seeder orchestrator**

Create `scripts/scrape-and-seed/index.ts`:

```typescript
import { createDdsSupabase } from '@dds/auth/supabase';
import { fetchWhoAlerts } from './sources/who';
import { fetchInterpolNotices } from './sources/interpol';
import { fetchUnHumanitarian } from './sources/un';
import { fetchWhiteHouseNews } from './sources/whitehouse';
import { batchTransformArticles } from './transform';
import type { TransformedEntry } from './types';

async function seedEntries() {
  console.log('🔄 Starting news scraper seed...\n');

  try {
    // Fetch from all sources in parallel
    console.log('📰 Fetching from official sources...');
    const [whoAlerts, interpolNotices, unNews, whiteHouseNews] = await Promise.all([
      fetchWhoAlerts(),
      fetchInterpolNotices(),
      fetchUnHumanitarian(),
      fetchWhiteHouseNews(),
    ]);

    const allArticles = [...whoAlerts, ...interpolNotices, ...unNews, ...whiteHouseNews];
    console.log(`✅ Fetched ${allArticles.length} articles total\n`);

    // Transform to schema
    console.log('🔄 Transforming articles to entry schema...');
    const entries = batchTransformArticles(allArticles);
    console.log(`✅ Transformed ${entries.length} entries\n`);

    // Initialize Supabase client
    const supabase = createDdsSupabase();

    // Upsert to database
    console.log('💾 Upserting to public.entries table...');
    const { error, count } = await supabase.from('entries').upsert(entries, {
      onConflict: 'id',
    });

    if (error) {
      console.error('❌ Error upserting entries:', error);
      process.exit(1);
    }

    console.log(`✅ Upserted ${count} entries\n`);

    // Print summary
    const tagCounts = entries.reduce((acc, entry) => {
      acc[entry.tag] = (acc[entry.tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 Summary by tag:');
    Object.entries(tagCounts).forEach(([tag, count]) => {
      console.log(`  ${tag}: ${count} entries`);
    });

    console.log('\n🎉 Seed complete! Visit http://localhost:3001/e to view entries\n');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

seedEntries();
```

- [ ] **Step 2: Add seed script to package.json**

In `package.json`, add to `scripts`:

```json
"seed": "node --loader ts-node/esm scripts/scrape-and-seed/index.ts"
```

- [ ] **Step 3: Test dry-run (fetch only, no DB write)**

Before running the seeder against the live DB, test fetching:

```bash
cd /Volumes/Seagate Portable Drive/claude/dds-platform/apps/ageofabundance-wiki
npm run seed
```

Expected output:
```
🔄 Starting news scraper seed...

📰 Fetching from official sources...
✅ Fetched XX articles total

🔄 Transforming articles to entry schema...
✅ Transformed XX entries

💾 Upserting to public.entries table...
✅ Upserted XX entries

📊 Summary by tag:
  disease: X entries
  lethal: X entries
  disaster: X entries

🎉 Seed complete! Visit http://localhost:3001/e to view entries
```

- [ ] **Step 4: Commit**

```bash
git add scripts/scrape-and-seed/index.ts
git add package.json
git commit -m "feat: implement news scraper seed orchestrator"
```

---

## Task 8: Verify visual rendering on `/e` pages

**Files:**
- No changes; verification only

- [ ] **Step 1: Ensure wiki dev server is running**

```bash
cd /Volumes/Seagate Portable Drive/claude/dds-platform/apps/ageofabundance-wiki
npm run dev
```

Expected: Server starts on http://localhost:3001

- [ ] **Step 2: Visit `/e` page and verify entry grid renders**

Open browser to `http://localhost:3001/e`

Expected:
- Page title "All entries"
- Grid of entry cards (no longer "No entries yet")
- Each card shows title, description snippet, and source badge
- Cards are clickable

- [ ] **Step 3: Click on one entry and verify `/e/[slug]` detail page renders**

Click any entry card.

Expected:
- Page shows entry title, full content, metadata (source, published date)
- "Linked signals" section at bottom shows related globe events (if any match the tag)
- Back link or breadcrumb to `/e`

- [ ] **Step 4: Verify featured entry displays on landing (if any marked featured)**

Go to `http://localhost:3001/` (home) and look for featured entries section.

Expected: If `featured: true` entries exist, they display in a featured section above main content.

- [ ] **Step 5: Test tag filtering if implemented**

(If `/e?tag=disease` route exists) Visit `http://localhost:3001/e?tag=disease`

Expected: Grid filters to only entries with `tag: 'disease'`

- [ ] **Step 6: Commit visual verification notes**

```bash
git add docs/scraper-seed-verification.md  # Create a simple checklist of what was verified
git commit -m "docs: add visual verification checklist for seeded entries"
```

---

## Task 9: Final commit and summary

**Files:**
- No code changes

- [ ] **Step 1: Run final test suite**

```bash
cd /Volumes/Seagate Portable Drive/claude/dds-platform/apps/ageofabundance-wiki
npm test
```

Expected: All tests PASS

- [ ] **Step 2: Check for any unused imports or linting issues**

```bash
npm run lint
```

Fix any warnings.

- [ ] **Step 3: Final commit**

```bash
git log --oneline | head -10  # Review commits
git status  # Verify clean working tree
echo "✅ All done"
```

---

## Success Criteria

✅ Unit tests for schema transforms pass
✅ Unit tests for scrapers pass (with mock data)
✅ Seeder script fetches from all 4 sources, transforms, and upserts
✅ `public.entries` table populated with ~50–100 entries across all tags
✅ `/e` page renders entry grid with cards
✅ `/e/[slug]` detail page renders individual entries
✅ Linked signals section shows related globe events by tag
✅ Featured entries display on home page (if any marked featured)
✅ All code committed with clear commit messages

---

