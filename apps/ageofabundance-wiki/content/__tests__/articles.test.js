import { describe, it, expect } from 'vitest';
import {
  articles,
  findArticleBySlug,
  listArticleSlugs,
  listArticlesByTag,
  listArticlesSortedByDate,
  listAllTags,
} from '../articles.js';
import { deriveWikiMeta } from '../wiki-meta.js';

describe('listArticlesByTag', () => {
  it('returns articles matching the given tag, sorted newest-first', () => {
    const results = listArticlesByTag('governance', deriveWikiMeta);
    expect(results.length).toBeGreaterThan(0);

    // Every result must include the "governance" tag
    for (const entry of results) {
      expect(entry.meta.tags).toContain('governance');
    }

    // Sorted descending by lastUpdatedISO
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1].meta.lastUpdatedISO ?? '';
      const curr = results[i].meta.lastUpdatedISO ?? '';
      expect(prev.localeCompare(curr)).toBeGreaterThanOrEqual(0);
    }
  });

  it('returns empty array for non-existent tag', () => {
    const results = listArticlesByTag('nonexistent-xyz', deriveWikiMeta);
    expect(results).toEqual([]);
  });

  it('is case-insensitive (tags are normalized lowercase)', () => {
    const lower = listArticlesByTag('governance', deriveWikiMeta);
    const upper = listArticlesByTag('GOVERNANCE', deriveWikiMeta);
    expect(lower.length).toBe(upper.length);
    expect(lower.map((e) => e.article.id)).toEqual(
      upper.map((e) => e.article.id),
    );
  });

  it('returns entries with both article and meta', () => {
    const results = listArticlesByTag('pillar', deriveWikiMeta);
    expect(results.length).toBeGreaterThan(0);
    for (const entry of results) {
      expect(entry.article).toBeDefined();
      expect(entry.article.id).toBeTruthy();
      expect(entry.meta).toBeDefined();
      expect(entry.meta.tags).toContain('pillar');
    }
  });
});

describe('listAllTags', () => {
  it('returns all unique tags sorted alphabetically', () => {
    const tags = listAllTags(deriveWikiMeta);
    expect(tags.length).toBeGreaterThan(0);

    // Sorted alphabetically
    const sorted = [...tags].sort();
    expect(tags).toEqual(sorted);

    // No duplicates
    expect(new Set(tags).size).toBe(tags.length);
  });
});

describe('listArticlesSortedByDate', () => {
  it('returns all articles sorted newest-first', () => {
    const results = listArticlesSortedByDate(deriveWikiMeta);
    expect(results.length).toBe(articles.length);

    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1].meta.lastUpdatedISO ?? '';
      const curr = results[i].meta.lastUpdatedISO ?? '';
      expect(prev.localeCompare(curr)).toBeGreaterThanOrEqual(0);
    }
  });
});
