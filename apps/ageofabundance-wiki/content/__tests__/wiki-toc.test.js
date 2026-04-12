import { describe, it, expect } from 'vitest';
import { slugifyHeading, extractTocEntries } from '../wiki-toc.js';

describe('slugifyHeading', () => {
  it('lowercases and hyphenates words', () => {
    expect(slugifyHeading('Core pillars')).toBe('core-pillars');
  });

  it('strips non-alphanumeric characters and collapses hyphens', () => {
    expect(slugifyHeading("Critiques & open questions!")).toBe('critiques-open-questions');
    expect(slugifyHeading('A  --  B')).toBe('a-b');
  });

  it('trims leading/trailing whitespace and hyphens', () => {
    expect(slugifyHeading('  Hello World  ')).toBe('hello-world');
  });

  it('handles single-word headings', () => {
    expect(slugifyHeading('Overview')).toBe('overview');
  });

  it('returns empty string for empty input', () => {
    expect(slugifyHeading('')).toBe('');
    expect(slugifyHeading('   ')).toBe('');
  });

  it('preserves unicode letters', () => {
    expect(slugifyHeading('Über uns')).toBe('über-uns');
  });
});

describe('extractTocEntries', () => {
  it('returns empty array for null/undefined article', () => {
    expect(extractTocEntries(null)).toEqual([]);
    expect(extractTocEntries(undefined)).toEqual([]);
  });

  it('returns empty array when article has no paragraphs', () => {
    expect(extractTocEntries({ content: {} })).toEqual([]);
    expect(extractTocEntries({ content: { paragraphs: [] } })).toEqual([]);
  });

  it('extracts entries from paragraphs with subtitles', () => {
    const article = {
      content: {
        paragraphs: [
          { subtitle: 'Origins of the term', description: 'text' },
          { subtitle: 'Core pillars', description: 'text' },
          { subtitle: 'Critiques and open questions', description: 'text' },
        ],
      },
    };
    const entries = extractTocEntries(article);
    expect(entries).toEqual([
      { id: 'origins-of-the-term', text: 'Origins of the term', level: 2 },
      { id: 'core-pillars', text: 'Core pillars', level: 2 },
      { id: 'critiques-and-open-questions', text: 'Critiques and open questions', level: 2 },
    ]);
  });

  it('skips paragraphs without subtitles', () => {
    const article = {
      content: {
        paragraphs: [
          { subtitle: 'First', description: 'text' },
          { description: 'no subtitle' },
          { subtitle: '', description: 'empty subtitle' },
          { subtitle: 'Last', description: 'text' },
        ],
      },
    };
    const entries = extractTocEntries(article);
    expect(entries).toHaveLength(2);
    expect(entries[0].text).toBe('First');
    expect(entries[1].text).toBe('Last');
  });

  it('deduplicates slugs for repeated headings', () => {
    const article = {
      content: {
        paragraphs: [
          { subtitle: 'Overview', description: 'a' },
          { subtitle: 'Overview', description: 'b' },
          { subtitle: 'Overview', description: 'c' },
        ],
      },
    };
    const entries = extractTocEntries(article);
    expect(entries.map((e) => e.id)).toEqual([
      'overview',
      'overview-2',
      'overview-3',
    ]);
  });

  it('all entries have level 2', () => {
    const article = {
      content: {
        paragraphs: [
          { subtitle: 'A', description: 'x' },
          { subtitle: 'B', description: 'y' },
        ],
      },
    };
    for (const entry of extractTocEntries(article)) {
      expect(entry.level).toBe(2);
    }
  });
});
