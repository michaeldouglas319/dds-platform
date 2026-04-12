import { describe, it, expect } from 'vitest';
import { buildSearchIndex, scoreEntry, searchIndex } from '../wiki-search.js';

describe('buildSearchIndex', () => {
  const index = buildSearchIndex();

  it('returns one entry per seed article', () => {
    expect(index.length).toBe(3);
  });

  it('each entry has required fields', () => {
    for (const entry of index) {
      expect(typeof entry.slug).toBe('string');
      expect(entry.slug.length).toBeGreaterThan(0);
      expect(typeof entry.title).toBe('string');
      expect(entry.title.length).toBeGreaterThan(0);
      expect(typeof entry.category).toBe('string');
      expect(typeof entry.summary).toBe('string');
      expect(typeof entry._text).toBe('string');
      expect(entry._text.length).toBeGreaterThan(0);
    }
  });

  it('_text is fully lowercased', () => {
    for (const entry of index) {
      expect(entry._text).toBe(entry._text.toLowerCase());
    }
  });

  it('_text contains article title for relevance weighting', () => {
    const aoa = index.find((e) => e.slug === 'age-of-abundance');
    expect(aoa._text).toContain('age of abundance');
  });

  it('_text contains article tags', () => {
    const aoa = index.find((e) => e.slug === 'age-of-abundance');
    expect(aoa._text).toContain('governance');
    expect(aoa._text).toContain('foundations');
  });

  it('_text contains body content', () => {
    const energy = index.find((e) => e.slug === 'energy-abundance');
    expect(energy._text).toContain('photovoltaic');
  });

  it('_text strips wiki-link syntax', () => {
    // [[Energy Abundance]] in body should become "energy abundance"
    const aoa = index.find((e) => e.slug === 'age-of-abundance');
    expect(aoa._text).not.toContain('[[');
    expect(aoa._text).not.toContain(']]');
  });

  it('preserves article titles correctly', () => {
    const titles = index.map((e) => e.title);
    expect(titles).toContain('Age of Abundance');
    expect(titles).toContain('Energy Abundance');
    expect(titles).toContain('Coordination Abundance');
  });
});

describe('scoreEntry', () => {
  const index = buildSearchIndex();
  const aoa = index.find((e) => e.slug === 'age-of-abundance');

  it('returns 0 for empty query', () => {
    expect(scoreEntry(aoa, '')).toBe(0);
    expect(scoreEntry(aoa, '   ')).toBe(0);
    expect(scoreEntry(aoa, null)).toBe(0);
    expect(scoreEntry(aoa, undefined)).toBe(0);
  });

  it('returns positive score for matching query', () => {
    expect(scoreEntry(aoa, 'abundance')).toBeGreaterThan(0);
  });

  it('returns 0 for non-matching query', () => {
    expect(scoreEntry(aoa, 'xyzzyplugh')).toBe(0);
  });

  it('AND semantics: all tokens must match', () => {
    // "abundance" matches, "xyzzy" does not — combined should be 0
    expect(scoreEntry(aoa, 'abundance xyzzy')).toBe(0);
  });

  it('title matches score higher than body-only matches', () => {
    // "abundance" appears in title (weighted 10x) + body
    // "ephemeralization" appears only in body
    const titleScore = scoreEntry(aoa, 'abundance');
    const bodyScore = scoreEntry(aoa, 'ephemeralization');
    expect(titleScore).toBeGreaterThan(bodyScore);
  });

  it('case-insensitive matching', () => {
    expect(scoreEntry(aoa, 'ABUNDANCE')).toBeGreaterThan(0);
    expect(scoreEntry(aoa, 'Abundance')).toBeGreaterThan(0);
  });

  it('prefix matching works (substring search)', () => {
    expect(scoreEntry(aoa, 'abund')).toBeGreaterThan(0);
    expect(scoreEntry(aoa, 'gov')).toBeGreaterThan(0);
  });
});

describe('searchIndex', () => {
  const index = buildSearchIndex();

  it('returns empty array for empty query', () => {
    expect(searchIndex(index, '')).toEqual([]);
    expect(searchIndex(index, '  ')).toEqual([]);
  });

  it('returns matching results sorted by relevance', () => {
    const results = searchIndex(index, 'energy');
    expect(results.length).toBeGreaterThan(0);
    // energy-abundance should rank highest since "energy" is in the title
    expect(results[0].entry.slug).toBe('energy-abundance');
  });

  it('multi-word queries narrow results', () => {
    const broad = searchIndex(index, 'pillar');
    const narrow = searchIndex(index, 'energy pillar');
    // narrow should have fewer or equal results
    expect(narrow.length).toBeLessThanOrEqual(broad.length);
  });

  it('returns results with score property', () => {
    const results = searchIndex(index, 'abundance');
    for (const r of results) {
      expect(typeof r.score).toBe('number');
      expect(r.score).toBeGreaterThan(0);
      expect(r.entry).toBeDefined();
    }
  });

  it('respects limit parameter', () => {
    const results = searchIndex(index, 'abundance', 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it('returns all matching articles for broad query', () => {
    // "abundance" appears in all 3 articles
    const results = searchIndex(index, 'abundance');
    expect(results.length).toBe(3);
  });

  it('non-matching query returns empty', () => {
    const results = searchIndex(index, 'zxcvbnm');
    expect(results).toEqual([]);
  });

  it('coordination query ranks coordination-abundance first', () => {
    const results = searchIndex(index, 'coordination');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].entry.slug).toBe('coordination-abundance');
  });

  it('tag-only search works (governance)', () => {
    const results = searchIndex(index, 'governance');
    expect(results.length).toBeGreaterThan(0);
    // governance is a tag on age-of-abundance and coordination-abundance
    const slugs = results.map((r) => r.entry.slug);
    expect(slugs).toContain('age-of-abundance');
    expect(slugs).toContain('coordination-abundance');
  });
});
