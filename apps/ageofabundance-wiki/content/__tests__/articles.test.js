import { describe, it, expect } from 'vitest';
import {
  articles,
  findArticleBySlug,
  listArticleSlugs,
  listAllTags,
  listArticlesSortedByDate,
  listArticlesForTag,
  listTagsWithCounts,
} from '../articles.js';
import { deriveWikiMeta } from '../wiki-meta.js';

describe('listArticlesForTag', () => {
  it('returns articles that carry the given tag, sorted newest-first', () => {
    const result = listArticlesForTag('governance', deriveWikiMeta);
    expect(result.length).toBeGreaterThan(0);
    for (const entry of result) {
      expect(entry.meta.tags).toContain('governance');
    }
  });

  it('returns empty array for a tag that does not exist', () => {
    const result = listArticlesForTag('nonexistent-xyz', deriveWikiMeta);
    expect(result).toEqual([]);
  });

  it('returns articles sorted by lastUpdatedISO descending', () => {
    const result = listArticlesForTag('pillar', deriveWikiMeta);
    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1].meta.lastUpdatedISO ?? '';
      const curr = result[i].meta.lastUpdatedISO ?? '';
      expect(prev.localeCompare(curr)).toBeGreaterThanOrEqual(0);
    }
  });

  it('each result has both article and meta properties', () => {
    const result = listArticlesForTag('concept', deriveWikiMeta);
    expect(result.length).toBeGreaterThan(0);
    for (const entry of result) {
      expect(entry.article).toBeDefined();
      expect(entry.article.id).toBeDefined();
      expect(entry.meta).toBeDefined();
      expect(entry.meta.tags).toBeDefined();
    }
  });
});

describe('listTagsWithCounts', () => {
  it('returns tags sorted alphabetically with counts', () => {
    const result = listTagsWithCounts(deriveWikiMeta);
    expect(result.length).toBeGreaterThan(0);

    // Sorted alphabetically
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].tag.localeCompare(result[i].tag)).toBeLessThanOrEqual(0);
    }
  });

  it('every tag has a positive count', () => {
    const result = listTagsWithCounts(deriveWikiMeta);
    for (const entry of result) {
      expect(typeof entry.tag).toBe('string');
      expect(entry.tag.length).toBeGreaterThan(0);
      expect(entry.count).toBeGreaterThan(0);
    }
  });

  it('tag counts match the number of articles returned by listArticlesForTag', () => {
    const result = listTagsWithCounts(deriveWikiMeta);
    for (const { tag, count } of result) {
      const articlesForTag = listArticlesForTag(tag, deriveWikiMeta);
      expect(articlesForTag.length).toBe(count);
    }
  });

  it('covers all tags from listAllTags', () => {
    const allTags = listAllTags(deriveWikiMeta);
    const tagCounts = listTagsWithCounts(deriveWikiMeta);
    const countTags = tagCounts.map((t) => t.tag).sort();
    expect(countTags).toEqual(allTags);
  });
});
