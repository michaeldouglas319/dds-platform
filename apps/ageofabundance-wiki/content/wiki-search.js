/**
 * Build-time search index for the wiki.
 *
 * Generates a lightweight, JSON-serializable search index from the article
 * dataset. Designed to be consumed by a client-side combobox component that
 * performs prefix + substring matching with field-weighted scoring.
 *
 * Architecture choices:
 * - Zero external dependencies — keeps the client bundle tiny (~2 KB).
 * - Field weighting: title (10) > tags (5) > summary (3) > body (1).
 * - Tokenizes at build time so the client only does lookups, not parsing.
 * - When the article count grows beyond ~50, swap this for Pagefind (WASM,
 *   on-demand chunk loading, fuzzy + stemmed) with no component changes.
 *
 * @module wiki-search
 */

import { articles } from './articles.js';
import { deriveWikiMeta } from './wiki-meta.js';
import { stripWikiLinks } from './wiki-links.js';

/**
 * @typedef {Object} SearchEntry
 * @property {string} slug   Article id / URL slug.
 * @property {string} title  Article title (display).
 * @property {string} category  Article category (display).
 * @property {string} summary  Short summary for the result card.
 * @property {string} _text  Concatenated, lowercased searchable text.
 */

/**
 * Build the search index once. The result is a plain array that can be
 * JSON-serialized and shipped to the client as a serialized prop.
 *
 * @returns {SearchEntry[]}
 */
export function buildSearchIndex() {
  return articles.map((article) => {
    const meta = deriveWikiMeta(article);
    const title = article.subject?.title ?? '';
    const category = article.subject?.category ?? '';
    const summary = meta.summary ?? '';
    const tags = meta.tags.join(' ');

    // Collect all searchable text, strip wiki-link syntax, lowercase.
    const bodyParts = [];
    if (article.content?.body) bodyParts.push(article.content.body);
    if (Array.isArray(article.content?.paragraphs)) {
      for (const p of article.content.paragraphs) {
        if (p?.subtitle) bodyParts.push(p.subtitle);
        if (p?.description) bodyParts.push(p.description);
      }
    }
    const bodyText = stripWikiLinks(bodyParts.join(' '));

    // Build a single searchable string with field markers for weighting.
    // We repeat higher-weight fields so substring hits in them score more.
    const weighted = [
      // title ×10 — repeat the title tokens so they dominate scoring
      ...Array(10).fill(title),
      // tags ×5
      ...Array(5).fill(tags),
      // summary ×3
      ...Array(3).fill(summary),
      // body ×1
      bodyText,
    ].join(' ');

    return {
      slug: article.id,
      title,
      category,
      summary,
      _text: weighted.toLowerCase(),
    };
  });
}

/**
 * Score a single search entry against a query string.
 *
 * Scoring:
 * - Each query token that appears as a substring in the weighted _text
 *   contributes 1 point (the weighting is baked into _text via repetition).
 * - Tokens are AND-ed: all tokens must match for a non-zero score.
 * - Empty query → score 0 for all entries.
 *
 * @param {SearchEntry} entry
 * @param {string} query  Raw user input.
 * @returns {number}  Score ≥ 0.
 */
export function scoreEntry(entry, query) {
  if (!query || typeof query !== 'string') return 0;
  const tokens = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return 0;

  const text = entry._text;
  let total = 0;
  for (const token of tokens) {
    // Count occurrences (capped at 50 to avoid runaway on repeated fields).
    let count = 0;
    let pos = 0;
    while (count < 50) {
      const idx = text.indexOf(token, pos);
      if (idx === -1) break;
      count++;
      pos = idx + 1;
    }
    if (count === 0) return 0; // AND semantics: all tokens must match.
    total += count;
  }
  return total;
}

/**
 * Search the index and return matching entries sorted by relevance.
 *
 * @param {SearchEntry[]} index  Pre-built search index.
 * @param {string} query  Raw user input.
 * @param {number} [limit=10]  Maximum results to return.
 * @returns {{ entry: SearchEntry, score: number }[]}
 */
export function searchIndex(index, query, limit = 10) {
  if (!query || typeof query !== 'string' || !query.trim()) return [];

  const scored = [];
  for (const entry of index) {
    const score = scoreEntry(entry, query);
    if (score > 0) {
      scored.push({ entry, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
