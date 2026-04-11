import { describe, it, expect } from 'vitest';
import {
  WORDS_PER_MINUTE,
  countWords,
  countWordsInArticle,
  estimateReadingMinutes,
  normalizeTags,
  normalizeAuthors,
  isValidISODate,
  formatUpdatedDate,
  deriveSummary,
  deriveWikiMeta,
} from '../wiki-meta.js';

describe('countWords', () => {
  it('returns 0 for empty or whitespace input', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
    expect(countWords('\n\t')).toBe(0);
  });

  it('returns 0 for non-strings', () => {
    // @ts-expect-error — runtime guard
    expect(countWords(null)).toBe(0);
    // @ts-expect-error — runtime guard
    expect(countWords(undefined)).toBe(0);
    // @ts-expect-error — runtime guard
    expect(countWords(42)).toBe(0);
  });

  it('counts whitespace-separated words', () => {
    expect(countWords('one two three')).toBe(3);
    expect(countWords('  leading and trailing  ')).toBe(3);
    expect(countWords('line\nbreaks\tare\rok')).toBe(4);
  });
});

describe('countWordsInArticle', () => {
  it('returns 0 for null / undefined / non-object', () => {
    expect(countWordsInArticle(null)).toBe(0);
    expect(countWordsInArticle(undefined)).toBe(0);
    // @ts-expect-error — runtime guard
    expect(countWordsInArticle('not an article')).toBe(0);
  });

  it('counts body and paragraph subtitle+description', () => {
    const article = {
      content: {
        body: 'one two three',
        paragraphs: [
          { subtitle: 'four five', description: 'six seven eight' },
          { description: 'nine ten' },
        ],
      },
    };
    expect(countWordsInArticle(article)).toBe(10);
  });

  it('tolerates missing content fields', () => {
    expect(countWordsInArticle({})).toBe(0);
    expect(countWordsInArticle({ content: {} })).toBe(0);
    expect(countWordsInArticle({ content: { paragraphs: [] } })).toBe(0);
    expect(countWordsInArticle({ content: { paragraphs: [{}] } })).toBe(0);
  });
});

describe('estimateReadingMinutes', () => {
  it('returns 0 for zero/negative/invalid word counts', () => {
    expect(estimateReadingMinutes(0)).toBe(0);
    expect(estimateReadingMinutes(-10)).toBe(0);
    expect(estimateReadingMinutes(NaN)).toBe(0);
    expect(estimateReadingMinutes(Infinity)).toBe(0);
  });

  it('floors at 1 minute for any non-empty article', () => {
    expect(estimateReadingMinutes(1)).toBe(1);
    expect(estimateReadingMinutes(50)).toBe(1);
    expect(estimateReadingMinutes(WORDS_PER_MINUTE)).toBe(1);
  });

  it('rounds up so partial minutes never truncate', () => {
    expect(estimateReadingMinutes(WORDS_PER_MINUTE + 1)).toBe(2);
    expect(estimateReadingMinutes(WORDS_PER_MINUTE * 3)).toBe(3);
    expect(estimateReadingMinutes(WORDS_PER_MINUTE * 3 + 1)).toBe(4);
  });

  it('honors a custom wpm override', () => {
    expect(estimateReadingMinutes(600, 200)).toBe(3);
    expect(estimateReadingMinutes(600, 0)).toBe(0);
  });
});

describe('normalizeTags', () => {
  it('returns an empty array for non-arrays', () => {
    expect(normalizeTags(null)).toEqual([]);
    expect(normalizeTags(undefined)).toEqual([]);
    // @ts-expect-error — runtime guard
    expect(normalizeTags('energy')).toEqual([]);
  });

  it('lowercases, trims, dedupes, drops empties', () => {
    expect(
      normalizeTags(['Energy', '  energy  ', 'Governance', '', '  ', 'PROTOCOLS', 'protocols']),
    ).toEqual(['energy', 'governance', 'protocols']);
  });

  it('preserves first-seen order', () => {
    expect(normalizeTags(['c', 'b', 'a', 'b'])).toEqual(['c', 'b', 'a']);
  });

  it('does not mutate input', () => {
    const input = ['Foo', 'Bar'];
    normalizeTags(input);
    expect(input).toEqual(['Foo', 'Bar']);
  });
});

describe('normalizeAuthors', () => {
  it('keeps case-sensitive distinct handles but dedupes exact repeats', () => {
    expect(normalizeAuthors(['Ada', 'ada', 'Ada', '  Grace  ', ''])).toEqual([
      'Ada',
      'ada',
      'Grace',
    ]);
  });

  it('returns an empty array for non-arrays', () => {
    expect(normalizeAuthors(null)).toEqual([]);
    expect(normalizeAuthors({})).toEqual([]);
  });
});

describe('isValidISODate', () => {
  it('accepts YYYY-MM-DD', () => {
    expect(isValidISODate('2026-04-11')).toBe(true);
    expect(isValidISODate('2000-01-01')).toBe(true);
  });

  it('accepts full ISO datetimes', () => {
    expect(isValidISODate('2026-04-11T12:00:00Z')).toBe(true);
  });

  it('rejects garbage', () => {
    expect(isValidISODate('')).toBe(false);
    expect(isValidISODate('not a date')).toBe(false);
    expect(isValidISODate('2026-13-40')).toBe(false);
    expect(isValidISODate(null)).toBe(false);
    expect(isValidISODate(undefined)).toBe(false);
    expect(isValidISODate(1234567890)).toBe(false);
  });
});

describe('formatUpdatedDate', () => {
  it('formats a valid ISO date as "Month D, YYYY" in UTC', () => {
    expect(formatUpdatedDate('2026-04-11')).toBe('April 11, 2026');
    expect(formatUpdatedDate('2000-01-01')).toBe('January 1, 2000');
  });

  it('returns null for invalid input', () => {
    expect(formatUpdatedDate('nope')).toBeNull();
    expect(formatUpdatedDate(null)).toBeNull();
  });
});

describe('deriveSummary', () => {
  it('prefers meta.wiki.summary', () => {
    expect(
      deriveSummary({
        meta: { wiki: { summary: 'authored summary' } },
        subject: { summary: 'subject summary' },
        content: { body: 'body text' },
      }),
    ).toBe('authored summary');
  });

  it('falls back to subject.summary → subject.subtitle → first sentence of body', () => {
    expect(deriveSummary({ subject: { summary: 'from subject' } })).toBe('from subject');
    expect(deriveSummary({ subject: { subtitle: 'from subtitle' } })).toBe('from subtitle');
    expect(
      deriveSummary({ content: { body: 'First sentence. Second sentence.' } }),
    ).toBe('First sentence.');
  });

  it('returns null if no source is available', () => {
    expect(deriveSummary({})).toBeNull();
    expect(deriveSummary(null)).toBeNull();
  });

  it('clips long first sentences', () => {
    const body = 'x'.repeat(300) + '.';
    const summary = deriveSummary({ content: { body } });
    expect(summary?.length).toBeLessThanOrEqual(240);
    expect(summary?.endsWith('…')).toBe(true);
  });
});

describe('deriveWikiMeta', () => {
  const article = {
    content: {
      body: 'one two three four',
      paragraphs: [{ subtitle: 'five six', description: 'seven eight nine ten' }],
    },
    subject: { subtitle: 'my subtitle' },
    meta: {
      wiki: {
        lastUpdatedISO: '2026-04-11',
        authors: ['ada', 'ada', 'Grace'],
        tags: ['Energy', 'energy', 'governance'],
      },
    },
  };

  it('derives wordCount + readingTimeMinutes when not explicit', () => {
    const m = deriveWikiMeta(article);
    expect(m.wordCount).toBe(10);
    expect(m.readingTimeMinutes).toBe(1);
  });

  it('honors explicit wordCount and readingTimeMinutes', () => {
    const m = deriveWikiMeta({
      ...article,
      meta: {
        wiki: {
          ...article.meta.wiki,
          wordCount: 1190,
          readingTimeMinutes: 7,
        },
      },
    });
    expect(m.wordCount).toBe(1190);
    expect(m.readingTimeMinutes).toBe(7);
  });

  it('normalizes authors and tags', () => {
    const m = deriveWikiMeta(article);
    expect(m.authors).toEqual(['ada', 'Grace']);
    expect(m.tags).toEqual(['energy', 'governance']);
  });

  it('formats updated date and falls back summary', () => {
    const m = deriveWikiMeta(article);
    expect(m.lastUpdatedISO).toBe('2026-04-11');
    expect(m.formattedUpdated).toBe('April 11, 2026');
    expect(m.summary).toBe('my subtitle');
  });

  it('returns sensible defaults for empty input', () => {
    const m = deriveWikiMeta(null);
    expect(m.lastUpdatedISO).toBeNull();
    expect(m.formattedUpdated).toBeNull();
    expect(m.authors).toEqual([]);
    expect(m.tags).toEqual([]);
    expect(m.wordCount).toBe(0);
    expect(m.readingTimeMinutes).toBe(0);
    expect(m.summary).toBeNull();
    expect(m.toc).toBe('auto');
    expect(m.infobox).toEqual({});
  });

  it('does not mutate the input article', () => {
    const input = JSON.parse(JSON.stringify(article));
    deriveWikiMeta(input);
    expect(input).toEqual(article);
  });

  it('returns a frozen object to protect consumers', () => {
    const m = deriveWikiMeta(article);
    expect(Object.isFrozen(m)).toBe(true);
  });

  it('rejects invalid ISO dates', () => {
    const m = deriveWikiMeta({
      meta: { wiki: { lastUpdatedISO: 'not a date' } },
    });
    expect(m.lastUpdatedISO).toBeNull();
    expect(m.formattedUpdated).toBeNull();
  });

  it('honors toc: off but defaults to auto', () => {
    expect(deriveWikiMeta({ meta: { wiki: { toc: 'off' } } }).toc).toBe('off');
    expect(deriveWikiMeta({ meta: { wiki: {} } }).toc).toBe('auto');
    expect(deriveWikiMeta({}).toc).toBe('auto');
  });
});
