import { describe, it, expect } from 'vitest';
import {
  articles,
  findArticleBySlug,
  listArticleSlugs,
  listAllTags,
  listArticlesByTag,
  listArticlesSortedByDate,
} from '../articles.js';
import { deriveWikiMeta } from '../wiki-meta.js';

describe('listArticlesByTag', () => {
  it('returns articles that carry the given tag', () => {
    const results = listArticlesByTag('governance', deriveWikiMeta);
    expect(results.length).toBeGreaterThan(0);
    for (const entry of results) {
      expect(entry.meta.tags).toContain('governance');
    }
  });

  it('returns an empty array for a non-existent tag', () => {
    const results = listArticlesByTag('nonexistent-tag-xyz', deriveWikiMeta);
    expect(results).toEqual([]);
  });

  it('returns entries with both article and meta fields', () => {
    const results = listArticlesByTag('pillar', deriveWikiMeta);
    expect(results.length).toBeGreaterThan(0);
    for (const entry of results) {
      expect(entry.article).toBeDefined();
      expect(entry.article.id).toBeTruthy();
      expect(entry.meta).toBeDefined();
      expect(entry.meta.tags).toContain('pillar');
    }
  });

  it('sorts results by lastUpdatedISO descending', () => {
    const results = listArticlesByTag('pillar', deriveWikiMeta);
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1].meta.lastUpdatedISO ?? '';
      const curr = results[i].meta.lastUpdatedISO ?? '';
      expect(prev >= curr).toBe(true);
    }
  });

  it('includes all matching articles — governance appears on at least 2', () => {
    const results = listArticlesByTag('governance', deriveWikiMeta);
    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it('does not include articles without the tag', () => {
    const results = listArticlesByTag('energy', deriveWikiMeta);
    const slugs = results.map((e) => e.article.id);
    expect(slugs).toContain('energy-abundance');
    expect(slugs).not.toContain('coordination-abundance');
  });
});

describe('listAllTags', () => {
  it('returns a sorted array of unique tags', () => {
    const tags = listAllTags(deriveWikiMeta);
    expect(tags.length).toBeGreaterThan(0);
    for (let i = 1; i < tags.length; i++) {
      expect(tags[i - 1] <= tags[i]).toBe(true);
    }
    // No duplicates
    expect(new Set(tags).size).toBe(tags.length);
  });

  it('includes known tags from seed data', () => {
    const tags = listAllTags(deriveWikiMeta);
    expect(tags).toContain('governance');
    expect(tags).toContain('pillar');
    expect(tags).toContain('energy');
  });
});
