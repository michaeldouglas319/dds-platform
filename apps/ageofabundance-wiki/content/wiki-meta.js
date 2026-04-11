/**
 * Wiki article metadata normalizer.
 *
 * Formalizes `meta.wiki` on a UniversalSection-shaped wiki article. The
 * core schema stays untouched: every field here is additive and optional,
 * and any section without `meta.wiki` still parses cleanly.
 *
 * Design:
 *   - Pure function, no runtime dependencies.
 *   - Explicit values in `meta.wiki` always win over derived values, so
 *     editors can override (e.g. a manually curated reading time).
 *   - Word count + reading time are derived at build time from the
 *     article body + paragraphs, so authors don't have to maintain them.
 *   - Reading time uses 225 wpm — the widely adopted Medium/ngryman
 *     convention for long-form prose.
 *   - Output is a stable, plain-object shape safe to serialize through
 *     React Server Component boundaries.
 *
 * This file is the single source of truth for wiki metadata display —
 * every consumer (article header, card, index, future TOC / backlinks /
 * search) should call `normalizeWikiMeta(article)` rather than reach
 * into `meta.wiki` directly.
 *
 * @typedef {Object} NormalizedWikiMeta
 * @property {string|null} lastUpdatedISO
 * @property {string|null} lastUpdatedDisplay  Human-readable, UTC-stable.
 * @property {string[]}    authors
 * @property {string[]}    tags
 * @property {string|null} summary
 * @property {number}      wordCount
 * @property {number}      readingTimeMinutes
 */

export const WIKI_WORDS_PER_MINUTE = 225;

/**
 * Count whitespace-separated words in a string. Robust to leading /
 * trailing / consecutive whitespace and to `null` / `undefined`.
 * @param {string | null | undefined} text
 * @returns {number}
 */
export function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * Estimate reading time in minutes for a given word count. Always
 * returns at least 1 minute so UI never shows "0 min read".
 * @param {number} wordCount
 * @returns {number}
 */
export function estimateReadingMinutes(wordCount) {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return 1;
  return Math.max(1, Math.ceil(wordCount / WIKI_WORDS_PER_MINUTE));
}

/**
 * Concatenate every body/paragraph string on a UniversalSection-shaped
 * article. This is the canonical "article text" used to derive word
 * count and reading time.
 * @param {{ content?: { body?: string, paragraphs?: Array<{ subtitle?: string, description?: string }> } }} article
 * @returns {string}
 */
export function extractArticleText(article) {
  if (!article || typeof article !== 'object') return '';
  const parts = [];
  const body = article.content?.body;
  if (typeof body === 'string') parts.push(body);
  const paragraphs = article.content?.paragraphs;
  if (Array.isArray(paragraphs)) {
    for (const p of paragraphs) {
      if (p && typeof p.subtitle === 'string') parts.push(p.subtitle);
      if (p && typeof p.description === 'string') parts.push(p.description);
    }
  }
  return parts.join(' ');
}

/**
 * Format an ISO date (YYYY-MM-DD) as a UTC-stable human string.
 * Returns `null` for missing / invalid input so callers can branch.
 * Always uses UTC so SSR and CSR agree regardless of server locale.
 * @param {string | null | undefined} iso
 * @returns {string|null}
 */
export function formatWikiDate(iso) {
  if (!iso || typeof iso !== 'string') return null;
  // Accept both "YYYY-MM-DD" and full ISO strings.
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00Z` : iso;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  const month = d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  return `${month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * Format a word count for display (e.g. `1,234 words`, `1 word`).
 * @param {number} count
 * @returns {string}
 */
export function formatWordCount(count) {
  const n = Number.isFinite(count) && count > 0 ? Math.round(count) : 0;
  const label = n === 1 ? 'word' : 'words';
  return `${n.toLocaleString('en-US')} ${label}`;
}

/**
 * Normalize a wiki article's metadata. Explicit values win; derived
 * values fill the gaps. Output shape is always stable.
 *
 * @param {any} article  UniversalSection-shaped wiki article.
 * @returns {NormalizedWikiMeta}
 */
export function normalizeWikiMeta(article) {
  const raw =
    article && typeof article === 'object' && article.meta && typeof article.meta === 'object'
      ? article.meta.wiki ?? {}
      : {};

  const text = extractArticleText(article);
  const derivedWordCount = countWords(text);
  const wordCount =
    Number.isFinite(raw.wordCount) && raw.wordCount > 0
      ? Math.round(raw.wordCount)
      : derivedWordCount;

  const readingTimeMinutes =
    Number.isFinite(raw.readingTimeMinutes) && raw.readingTimeMinutes > 0
      ? Math.round(raw.readingTimeMinutes)
      : estimateReadingMinutes(wordCount);

  const lastUpdatedISO =
    typeof raw.lastUpdatedISO === 'string' && raw.lastUpdatedISO.length > 0
      ? raw.lastUpdatedISO
      : null;

  const authors = Array.isArray(raw.authors)
    ? raw.authors.filter((a) => typeof a === 'string' && a.length > 0)
    : [];

  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((t) => typeof t === 'string' && t.length > 0)
    : [];

  const summary =
    (typeof raw.summary === 'string' && raw.summary.length > 0 && raw.summary) ||
    (typeof article?.subject?.summary === 'string' && article.subject.summary) ||
    null;

  return {
    lastUpdatedISO,
    lastUpdatedDisplay: formatWikiDate(lastUpdatedISO),
    authors,
    tags,
    summary,
    wordCount,
    readingTimeMinutes,
  };
}
