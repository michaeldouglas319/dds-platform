import { describe, it, expect } from 'vitest';
import {
  countWords,
  estimateReadingMinutes,
  extractArticleText,
  formatWikiDate,
  formatWordCount,
  normalizeWikiMeta,
  WIKI_WORDS_PER_MINUTE,
} from './wiki-meta.js';

describe('countWords', () => {
  it('returns 0 for empty / nullish input', () => {
    expect(countWords('')).toBe(0);
    expect(countWords(null)).toBe(0);
    expect(countWords(undefined)).toBe(0);
    expect(countWords('   ')).toBe(0);
  });

  it('counts whitespace-separated words', () => {
    expect(countWords('one')).toBe(1);
    expect(countWords('one two three')).toBe(3);
  });

  it('collapses consecutive whitespace', () => {
    expect(countWords('  one\n\ntwo\t three  ')).toBe(3);
  });

  it('handles punctuation as part of the containing word', () => {
    expect(countWords('hello, world! — really?')).toBe(4);
  });
});

describe('estimateReadingMinutes', () => {
  it('always returns at least 1 minute', () => {
    expect(estimateReadingMinutes(0)).toBe(1);
    expect(estimateReadingMinutes(1)).toBe(1);
    expect(estimateReadingMinutes(WIKI_WORDS_PER_MINUTE)).toBe(1);
  });

  it('rounds up partial minutes', () => {
    expect(estimateReadingMinutes(WIKI_WORDS_PER_MINUTE + 1)).toBe(2);
    expect(estimateReadingMinutes(WIKI_WORDS_PER_MINUTE * 4)).toBe(4);
    expect(estimateReadingMinutes(WIKI_WORDS_PER_MINUTE * 4 + 1)).toBe(5);
  });

  it('handles invalid input defensively', () => {
    expect(estimateReadingMinutes(NaN)).toBe(1);
    expect(estimateReadingMinutes(-10)).toBe(1);
  });
});

describe('extractArticleText', () => {
  it('concatenates body + paragraph subtitle + description', () => {
    const text = extractArticleText({
      content: {
        body: 'Lede sentence.',
        paragraphs: [
          { subtitle: 'First heading', description: 'First body.' },
          { subtitle: 'Second heading', description: 'Second body.' },
        ],
      },
    });
    expect(text).toContain('Lede sentence.');
    expect(text).toContain('First heading');
    expect(text).toContain('First body.');
    expect(text).toContain('Second heading');
    expect(text).toContain('Second body.');
  });

  it('returns empty string when no content is present', () => {
    expect(extractArticleText({})).toBe('');
    expect(extractArticleText(null)).toBe('');
    expect(extractArticleText({ content: {} })).toBe('');
  });

  it('ignores non-string paragraph fields', () => {
    const text = extractArticleText({
      content: {
        body: 'Body.',
        paragraphs: [{ subtitle: 42, description: null }, null, 'nope'],
      },
    });
    expect(text).toBe('Body.');
  });
});

describe('formatWikiDate', () => {
  it('formats ISO dates in UTC', () => {
    expect(formatWikiDate('2026-04-11')).toBe('April 11, 2026');
    expect(formatWikiDate('2025-01-01')).toBe('January 1, 2025');
  });

  it('returns null for missing / invalid input', () => {
    expect(formatWikiDate(null)).toBeNull();
    expect(formatWikiDate('')).toBeNull();
    expect(formatWikiDate('not-a-date')).toBeNull();
  });
});

describe('formatWordCount', () => {
  it('pluralizes correctly and thousand-separates', () => {
    expect(formatWordCount(0)).toBe('0 words');
    expect(formatWordCount(1)).toBe('1 word');
    expect(formatWordCount(2)).toBe('2 words');
    expect(formatWordCount(1234)).toBe('1,234 words');
  });

  it('handles invalid input defensively', () => {
    expect(formatWordCount(NaN)).toBe('0 words');
    expect(formatWordCount(-5)).toBe('0 words');
  });
});

describe('normalizeWikiMeta', () => {
  const baseArticle = {
    subject: { title: 'Test', summary: 'Fallback summary.' },
    content: {
      body: 'Body text with five words.',
      paragraphs: [
        { subtitle: 'Heading two', description: 'Another short paragraph here.' },
      ],
    },
    meta: {
      wiki: {
        lastUpdatedISO: '2026-04-11',
        authors: ['ada', 'grace'],
        tags: ['concept', 'test'],
        summary: 'Explicit summary.',
      },
    },
  };

  it('derives wordCount + readingTime when not explicitly set', () => {
    const meta = normalizeWikiMeta(baseArticle);
    // "Body text with five words." = 5, "Heading two" = 2, "Another short paragraph here." = 4
    expect(meta.wordCount).toBe(11);
    expect(meta.readingTimeMinutes).toBe(1); // rounds up to 1 min
  });

  it('preserves explicit reading time / word count overrides', () => {
    const meta = normalizeWikiMeta({
      ...baseArticle,
      meta: {
        wiki: {
          ...baseArticle.meta.wiki,
          readingTimeMinutes: 9,
          wordCount: 2000,
        },
      },
    });
    expect(meta.readingTimeMinutes).toBe(9);
    expect(meta.wordCount).toBe(2000);
  });

  it('normalizes authors / tags / summary', () => {
    const meta = normalizeWikiMeta(baseArticle);
    expect(meta.authors).toEqual(['ada', 'grace']);
    expect(meta.tags).toEqual(['concept', 'test']);
    expect(meta.summary).toBe('Explicit summary.');
    expect(meta.lastUpdatedISO).toBe('2026-04-11');
    expect(meta.lastUpdatedDisplay).toBe('April 11, 2026');
  });

  it('falls back to subject.summary when meta.wiki.summary is missing', () => {
    const meta = normalizeWikiMeta({
      ...baseArticle,
      meta: { wiki: { ...baseArticle.meta.wiki, summary: undefined } },
    });
    expect(meta.summary).toBe('Fallback summary.');
  });

  it('returns a stable shape for articles with no meta.wiki at all', () => {
    const meta = normalizeWikiMeta({
      content: { body: 'just a body' },
    });
    expect(meta).toEqual({
      lastUpdatedISO: null,
      lastUpdatedDisplay: null,
      authors: [],
      tags: [],
      summary: null,
      wordCount: 3,
      readingTimeMinutes: 1,
    });
  });

  it('filters out non-string authors / tags defensively', () => {
    const meta = normalizeWikiMeta({
      content: { body: 'text' },
      meta: {
        wiki: {
          authors: ['ada', null, 42, '', 'grace'],
          tags: ['ok', '', null, 'fine'],
        },
      },
    });
    expect(meta.authors).toEqual(['ada', 'grace']);
    expect(meta.tags).toEqual(['ok', 'fine']);
  });

  it('handles a totally empty article without throwing', () => {
    const meta = normalizeWikiMeta({});
    expect(meta.wordCount).toBe(0);
    expect(meta.readingTimeMinutes).toBe(1);
    expect(meta.authors).toEqual([]);
    expect(meta.tags).toEqual([]);
  });
});
