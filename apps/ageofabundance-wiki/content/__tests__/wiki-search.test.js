import { describe, it, expect, beforeEach } from 'vitest';

// Reset cached index between tests
let buildSearchIndex, searchArticles, getSearchEntries;

beforeEach(async () => {
  // Re-import to get a fresh module (cache is module-level)
  const mod = await import('../wiki-search.js');
  buildSearchIndex = mod.buildSearchIndex;
  searchArticles = mod.searchArticles;
  getSearchEntries = mod.getSearchEntries;
});

describe('buildSearchIndex', () => {
  it('returns an array with one entry per article', () => {
    const index = buildSearchIndex();
    expect(Array.isArray(index)).toBe(true);
    expect(index.length).toBe(3);
  });

  it('each entry has the required shape', () => {
    const index = buildSearchIndex();
    for (const entry of index) {
      expect(entry).toHaveProperty('slug');
      expect(entry).toHaveProperty('title');
      expect(entry).toHaveProperty('summary');
      expect(entry).toHaveProperty('category');
      expect(entry).toHaveProperty('tags');
      expect(entry).toHaveProperty('searchText');
      expect(typeof entry.slug).toBe('string');
      expect(typeof entry.searchText).toBe('string');
      expect(Array.isArray(entry.tags)).toBe(true);
    }
  });

  it('searchText is lowercased', () => {
    const index = buildSearchIndex();
    for (const entry of index) {
      expect(entry.searchText).toBe(entry.searchText.toLowerCase());
    }
  });

  it('searchText does not contain wiki-link bracket syntax', () => {
    const index = buildSearchIndex();
    for (const entry of index) {
      expect(entry.searchText).not.toMatch(/\[\[/);
      expect(entry.searchText).not.toMatch(/\]\]/);
    }
  });

  it('searchText includes the article title', () => {
    const index = buildSearchIndex();
    const energy = index.find((e) => e.slug === 'energy-abundance');
    expect(energy.searchText).toContain('energy abundance');
  });
});

describe('searchArticles', () => {
  it('returns empty array for empty query', () => {
    expect(searchArticles('')).toEqual([]);
    expect(searchArticles('   ')).toEqual([]);
    expect(searchArticles(null)).toEqual([]);
    expect(searchArticles(undefined)).toEqual([]);
  });

  it('matches by title', () => {
    const results = searchArticles('Energy');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe('energy-abundance');
  });

  it('matches by tag', () => {
    const results = searchArticles('governance');
    expect(results.length).toBeGreaterThan(0);
    const slugs = results.map((r) => r.slug);
    expect(slugs).toContain('age-of-abundance');
    expect(slugs).toContain('coordination-abundance');
  });

  it('matching is case-insensitive', () => {
    const upper = searchArticles('ENERGY');
    const lower = searchArticles('energy');
    expect(upper.length).toBe(lower.length);
    expect(upper[0].slug).toBe(lower[0].slug);
  });

  it('title matches rank higher than body matches', () => {
    // "Energy Abundance" has "energy" in its title
    // Other articles reference energy in body text
    const results = searchArticles('energy');
    expect(results[0].slug).toBe('energy-abundance');
  });

  it('returns at most `limit` results', () => {
    const results = searchArticles('abundance', 1);
    expect(results.length).toBe(1);
  });

  it('returns no results for non-matching query', () => {
    expect(searchArticles('xyznonexistent123')).toEqual([]);
  });
});

describe('getSearchEntries', () => {
  it('returns entries without searchText (client-safe)', () => {
    const entries = getSearchEntries();
    expect(entries.length).toBe(3);
    for (const entry of entries) {
      expect(entry).toHaveProperty('slug');
      expect(entry).toHaveProperty('title');
      expect(entry).toHaveProperty('summary');
      expect(entry).toHaveProperty('category');
      expect(entry).toHaveProperty('tags');
      expect(entry).not.toHaveProperty('searchText');
    }
  });
});
