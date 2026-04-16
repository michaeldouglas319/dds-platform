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

  it('extracts description from RSS items', async () => {
    const mockRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Test Alert</title>
      <description>Test description content</description>
      <link>https://who.int/test</link>
      <pubDate>Wed, 16 Apr 2026 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(new Response(mockRss, { status: 200 }))
    ));

    const articles = await fetchWhoAlerts();

    expect(articles[0].description).toBe('Test description content');
  });

  it('parses pubDate correctly to ISO format', async () => {
    const mockRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Test Alert</title>
      <description>Test</description>
      <link>https://who.int/test</link>
      <pubDate>Wed, 16 Apr 2026 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(new Response(mockRss, { status: 200 }))
    ));

    const articles = await fetchWhoAlerts();

    expect(articles[0].published_date).toBeDefined();
    expect(articles[0].published_date).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  it('handles HTTP error responses gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(new Response('Not Found', { status: 404 }))
    ));

    const articles = await fetchWhoAlerts();

    expect(articles).toEqual([]);
  });
});
