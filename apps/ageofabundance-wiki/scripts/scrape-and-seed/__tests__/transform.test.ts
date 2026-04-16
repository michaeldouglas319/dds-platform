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

    expect(entry.slug).toBe('white-house-and-covid-19-whats-next');
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
