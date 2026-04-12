import { describe, it, expect } from 'vitest';
import {
  listArticlesByTag,
  listAllTags,
  listArticlesSortedByDate,
} from '../articles.js';
import { deriveWikiMeta } from '../wiki-meta.js';

describe('listArticlesByTag', () => {
  it('returns articles matching the given tag', () => {
    const result = listArticlesByTag('governance', deriveWikiMeta);
    expect(result.length).toBe(2);
    const slugs = result.map((e) => e.article.id);
    expect(slugs).toContain('age-of-abundance');
    expect(slugs).toContain('coordination-abundance');
  });

  it('returns empty array for a non-existent tag', () => {
    const result = listArticlesByTag('nonexistent-tag-xyz', deriveWikiMeta);
    expect(result).toEqual([]);
  });

  it('returns results sorted by lastUpdatedISO descending', () => {
    const result = listArticlesByTag('pillar', deriveWikiMeta);
    expect(result.length).toBe(2);
    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1].meta.lastUpdatedISO ?? '';
      const curr = result[i].meta.lastUpdatedISO ?? '';
      expect(prev >= curr).toBe(true);
    }
  });

  it('each entry has both article and meta fields', () => {
    const result = listArticlesByTag('governance', deriveWikiMeta);
    for (const entry of result) {
      expect(entry.article).toBeDefined();
      expect(entry.article.id).toBeTruthy();
      expect(entry.meta).toBeDefined();
      expect(Array.isArray(entry.meta.tags)).toBe(true);
      expect(entry.meta.tags).toContain('governance');
    }
  });

  it('listAllTags returns all tags used across articles', () => {
    const tags = listAllTags(deriveWikiMeta);
    expect(tags.length).toBeGreaterThan(0);
    // Tags are sorted alphabetically
    const sorted = [...tags].sort();
    expect(tags).toEqual(sorted);
    // Known tags from seed data
    expect(tags).toContain('governance');
    expect(tags).toContain('energy');
    expect(tags).toContain('pillar');
  });
});
