/**
 * Wiki search index and query engine.
 *
 * Builds a pre-computed, in-memory search index from the article dataset.
 * Each article is tokenized into searchable text drawn from its title,
 * summary, body, tags, and paragraph descriptions. Wiki-link syntax is
 * stripped so bracket notation never appears in search results.
 *
 * The search function performs case-insensitive substring matching against
 * the pre-joined searchable text. This is intentionally simple — for a
 * small static dataset it is fast and dependency-free. The API is designed
 * so the implementation can be swapped to FlexSearch or Pagefind later
 * without changing the consumer contract.
 *
 * Pure functions, no side effects — safe for both RSC and client use.
 */

import { articles } from './articles.js';
import { stripWikiLinks } from './wiki-links.js';

/**
 * @typedef {Object} SearchEntry
 * @property {string} slug
 * @property {string} title
 * @property {string} summary
 * @property {string} category
 * @property {string[]} tags
 * @property {string} searchText  — lowercased, joined searchable content
 */

/** @type {SearchEntry[] | null} */
let _index = null;

/**
 * Build (or return cached) search index from the article dataset.
 *
 * @returns {SearchEntry[]}
 */
export function buildSearchIndex() {
  if (_index) return _index;

  _index = articles.map((article) => {
    const title = article.subject?.title ?? '';
    const subtitle = article.subject?.subtitle ?? '';
    const summary =
      article.meta?.wiki?.summary ??
      article.subject?.summary ??
      subtitle;
    const category = article.subject?.category ?? '';
    const tags = article.meta?.wiki?.tags ?? [];
    const body = stripWikiLinks(article.content?.body ?? '');
    const paragraphText = (article.content?.paragraphs ?? [])
      .map((p) =>
        [
          stripWikiLinks(p.subtitle ?? ''),
          stripWikiLinks(p.description ?? ''),
        ].join(' '),
      )
      .join(' ');

    const searchText = [title, subtitle, summary, category, tags.join(' '), body, paragraphText]
      .join(' ')
      .toLowerCase();

    return {
      slug: article.id,
      title,
      summary,
      category,
      tags,
      searchText,
    };
  });

  return _index;
}

/**
 * Search articles by query string.
 *
 * Returns matching entries ranked by a simple relevance heuristic:
 * title matches score highest, then summary, then body.
 *
 * @param {string} query  — raw user input
 * @param {number} [limit=10]  — max results
 * @returns {SearchEntry[]}
 */
export function searchArticles(query, limit = 10) {
  if (typeof query !== 'string' || query.trim().length === 0) return [];

  const index = buildSearchIndex();
  const q = query.trim().toLowerCase();

  // Score each entry: title match = 3, summary match = 2, any match = 1
  const scored = [];
  for (const entry of index) {
    if (!entry.searchText.includes(q)) continue;

    let score = 1;
    if (entry.title.toLowerCase().includes(q)) score += 3;
    if (entry.summary.toLowerCase().includes(q)) score += 2;

    scored.push({ entry, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.entry);
}

/**
 * Return all search entries — used for pre-populating the client-side
 * search index without a second import of the articles module.
 *
 * @returns {Pick<SearchEntry, 'slug' | 'title' | 'summary' | 'category' | 'tags'>[] }
 */
export function getSearchEntries() {
  return buildSearchIndex().map(({ slug, title, summary, category, tags }) => ({
    slug,
    title,
    summary,
    category,
    tags,
  }));
}
