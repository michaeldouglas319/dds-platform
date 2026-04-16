import { describe, it, expect, vi } from 'vitest';
import { fetchWhoAlerts } from '../sources/who';
import { fetchInterpolNotices } from '../sources/interpol';
import { fetchUnHumanitarian } from '../sources/un';
import { fetchWhiteHouseNews } from '../sources/whitehouse';
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

describe('fetchInterpolNotices', () => {
  it('parses INTERPOL notices from RSS feed', async () => {
    const mockRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>INTERPOL News</title>
    <item>
      <title>International Wanted Person: Armed Robbery Ring</title>
      <description>INTERPOL seeks information on suspects in organized robbery</description>
      <link>https://interpol.int/notices/123</link>
      <pubDate>Wed, 16 Apr 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Cyber Crime Alert: Ransomware Campaign</title>
      <description>Global alert for new ransomware threats</description>
      <link>https://interpol.int/notices/124</link>
      <pubDate>Tue, 15 Apr 2026 14:30:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(new Response(mockRss, { status: 200 }))
    ));

    const articles = await fetchInterpolNotices();

    expect(articles).toHaveLength(2);
    expect(articles[0].title).toBe('International Wanted Person: Armed Robbery Ring');
    expect(articles[0].source).toBe('interpol');
    expect(articles[0].url).toBe('https://interpol.int/notices/123');
  });

  it('returns empty array if fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));

    const articles = await fetchInterpolNotices();

    expect(articles).toEqual([]);
  });
});

describe('fetchUnHumanitarian', () => {
  it('parses UN humanitarian news from RSS feed', async () => {
    const mockRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>UN OCHA News</title>
    <item>
      <title>Earthquake Relief Coordination in Turkey</title>
      <description>UN launches emergency response to earthquake disaster</description>
      <link>https://un.org/humanitarian/earthquake-relief</link>
      <pubDate>Wed, 16 Apr 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Humanitarian Crisis in South Sudan</title>
      <description>UN appeals for urgent funding for food aid</description>
      <link>https://un.org/humanitarian/south-sudan</link>
      <pubDate>Tue, 15 Apr 2026 14:30:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(new Response(mockRss, { status: 200 }))
    ));

    const articles = await fetchUnHumanitarian();

    expect(articles).toHaveLength(2);
    expect(articles[0].title).toBe('Earthquake Relief Coordination in Turkey');
    expect(articles[0].source).toBe('un');
    expect(articles[0].url).toBe('https://un.org/humanitarian/earthquake-relief');
  });

  it('returns empty array if fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));

    const articles = await fetchUnHumanitarian();

    expect(articles).toEqual([]);
  });
});

describe('fetchWhiteHouseNews', () => {
  it('parses White House news from RSS feed', async () => {
    const mockRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>White House News</title>
    <item>
      <title>President Announces Emergency Relief Package</title>
      <description>Federal response to natural disaster outlined</description>
      <link>https://whitehouse.gov/news/relief-package</link>
      <pubDate>Wed, 16 Apr 2026 10:00:00 GMT</pubDate>
    </item>
    <item>
      <title>White House COVID-19 Update</title>
      <description>Latest public health guidance released</description>
      <link>https://whitehouse.gov/news/covid-update</link>
      <pubDate>Tue, 15 Apr 2026 14:30:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(new Response(mockRss, { status: 200 }))
    ));

    const articles = await fetchWhiteHouseNews();

    expect(articles).toHaveLength(2);
    expect(articles[0].title).toBe('President Announces Emergency Relief Package');
    expect(articles[0].source).toBe('whitehouse');
    expect(articles[0].url).toBe('https://whitehouse.gov/news/relief-package');
  });

  it('returns empty array if fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));

    const articles = await fetchWhiteHouseNews();

    expect(articles).toEqual([]);
  });
});
