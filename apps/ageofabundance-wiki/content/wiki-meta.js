/**
 * Wiki article metadata contract + derivation helpers.
 *
 * This module is the single source of truth for everything a wiki article
 * exposes under `meta.wiki`. Every consumer in the wiki app (article page,
 * article card, index, search, recent-changes feed, JSON-LD emitter) MUST
 * read metadata through {@link deriveWikiMeta} rather than reaching into
 * `article.meta.wiki` directly. That guarantee is what makes downstream
 * features — TOC, backlinks, search, OG images — trivially composable.
 *
 * ## Backward compatibility
 * - `@dds/types` exports `meta` as `Record<string, unknown>`, so no core
 *   schema change is required. Every `meta.wiki` field is optional; the
 *   helper fills in sensible defaults. Articles that lack `meta.wiki`
 *   entirely still parse and render.
 * - Articles MAY override any derived field with an explicit value. When
 *   both exist, the explicit value wins — the derive helper never
 *   clobbers authored metadata.
 *
 * ## Field contract
 *
 * @typedef {Object} WikiMetaInput
 *   The raw, optional fields an author may place under `article.meta.wiki`.
 * @property {string} [lastUpdatedISO] ISO 8601 date (e.g. "2026-04-11").
 * @property {string[]} [authors] Author handles/names. Normalized on read.
 * @property {number} [readingTimeMinutes] Explicit override. Otherwise
 *   derived from `wordCount` at {@link WORDS_PER_MINUTE}.
 * @property {number} [wordCount] Explicit override. Otherwise derived from
 *   `content.body` + `content.paragraphs[].subtitle|description`.
 * @property {string[]} [tags] Free-form tags. Normalized on read.
 * @property {string} [summary] Short editorial summary.
 * @property {'auto' | 'off'} [toc] TOC mode for this article.
 * @property {Record<string, string>} [infobox] Key/value facts for the
 *   sidebar infobox primitive (see P1 backlog).
 *
 * @typedef {Object} WikiMetaDerived
 *   The fully-resolved metadata every consumer sees.
 * @property {string | null} lastUpdatedISO
 * @property {string | null} formattedUpdated Locale-stable human string.
 * @property {string[]} authors
 * @property {number} wordCount
 * @property {number} readingTimeMinutes Always ≥ 1 when wordCount > 0.
 * @property {string[]} tags Normalized: lowercased, trimmed, deduped.
 * @property {string | null} summary Best-effort summary (see lookup order).
 * @property {'auto' | 'off'} toc
 * @property {Record<string, string>} infobox
 */

/**
 * Meta-analysis-backed average silent reading speed (words per minute) from
 * Brysbaert (2019), "How many words do we read per minute? A review and
 * meta-analysis of reading rate", Journal of Memory and Language. We use
 * the silent-reading average rather than a faster skim rate because wiki
 * articles target comprehension, not skim.
 */
import { stripWikiLinks } from './wiki-links.js';

export const WORDS_PER_MINUTE = 238;

/**
 * Count words across every text-bearing field of an article's content.
 * Deterministic — safe to call at build time.
 *
 * @param {object | null | undefined} article
 * @returns {number}
 */
export function countWordsInArticle(article) {
  if (!article || typeof article !== 'object') return 0;
  const content = article.content ?? {};
  /** @type {string[]} */
  const parts = [];
  // Flatten any inline `[[target|display]]` wiki-link syntax to its
  // display text so `[[energy-abundance|energy]]` contributes "energy"
  // (one real word) rather than the literal bracket token.
  if (typeof content.body === 'string') parts.push(stripWikiLinks(content.body));
  if (Array.isArray(content.paragraphs)) {
    for (const p of content.paragraphs) {
      if (p && typeof p.subtitle === 'string') parts.push(stripWikiLinks(p.subtitle));
      if (p && typeof p.description === 'string') parts.push(stripWikiLinks(p.description));
    }
  }
  if (parts.length === 0) return 0;
  return countWords(parts.join(' '));
}

/**
 * Count words in a single string. Splits on any unicode whitespace; empty
 * and whitespace-only inputs yield 0.
 *
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
  if (typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  // \s covers ASCII + most unicode whitespace; sufficient for long-form prose.
  return trimmed.split(/\s+/).length;
}

/**
 * Convert a word count to an integer number of minutes, using
 * {@link WORDS_PER_MINUTE} unless overridden. Floors at 1 minute for any
 * non-empty article so the UI never shows "0 min".
 *
 * @param {number} wordCount
 * @param {number} [wpm=WORDS_PER_MINUTE]
 * @returns {number}
 */
export function estimateReadingMinutes(wordCount, wpm = WORDS_PER_MINUTE) {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return 0;
  if (!Number.isFinite(wpm) || wpm <= 0) return 0;
  return Math.max(1, Math.ceil(wordCount / wpm));
}

/**
 * Normalize a tag list: lowercase, trim, drop empties, dedupe while
 * preserving first-seen order. Never mutates the input.
 *
 * @param {unknown} tags
 * @returns {string[]}
 */
export function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  /** @type {string[]} */
  const out = [];
  const seen = new Set();
  for (const raw of tags) {
    if (typeof raw !== 'string') continue;
    const t = raw.trim().toLowerCase();
    if (t.length === 0) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/**
 * Normalize an author list: trim, drop empties, dedupe (case-sensitive so
 * "editorial" and "Editorial" remain distinct handles). Never mutates.
 *
 * @param {unknown} authors
 * @returns {string[]}
 */
export function normalizeAuthors(authors) {
  if (!Array.isArray(authors)) return [];
  /** @type {string[]} */
  const out = [];
  const seen = new Set();
  for (const raw of authors) {
    if (typeof raw !== 'string') continue;
    const a = raw.trim();
    if (a.length === 0) continue;
    if (seen.has(a)) continue;
    seen.add(a);
    out.push(a);
  }
  return out;
}

/**
 * Loose ISO 8601 date check — accepts `YYYY-MM-DD` and full datetimes.
 * Rejects invalid dates (e.g. `2026-13-40`) by round-tripping through Date.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidISODate(value) {
  if (typeof value !== 'string' || value.length < 10) return false;
  const d = new Date(value.length === 10 ? value + 'T00:00:00Z' : value);
  return !Number.isNaN(d.getTime());
}

/**
 * Format an ISO date as a locale-stable human string (e.g. "April 11, 2026").
 * Returns `null` for invalid input. Uses UTC so SSR and CSR agree byte-for-byte.
 *
 * @param {unknown} value
 * @returns {string | null}
 */
export function formatUpdatedDate(value) {
  if (!isValidISODate(value)) return null;
  const iso = /** @type {string} */ (value);
  const d = new Date(iso.length === 10 ? iso + 'T00:00:00Z' : iso);
  const month = d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  return `${month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * Derive a best-effort summary from an article, in priority order:
 *   1. `meta.wiki.summary`
 *   2. `subject.summary`
 *   3. `subject.subtitle`
 *   4. First sentence of `content.body` (≤ 240 chars)
 *
 * @param {object | null | undefined} article
 * @returns {string | null}
 */
export function deriveSummary(article) {
  if (!article || typeof article !== 'object') return null;
  const wiki = article.meta?.wiki ?? {};
  if (typeof wiki.summary === 'string' && wiki.summary.trim()) {
    return wiki.summary.trim();
  }
  const subject = article.subject ?? {};
  if (typeof subject.summary === 'string' && subject.summary.trim()) {
    return subject.summary.trim();
  }
  if (typeof subject.subtitle === 'string' && subject.subtitle.trim()) {
    return subject.subtitle.trim();
  }
  const body = article.content?.body;
  if (typeof body === 'string' && body.trim()) {
    // Strip wiki-link syntax so OG/JSON-LD description never surfaces raw
    // `[[…]]` tokens. First sentence, clipped to ~240 chars.
    const flat = stripWikiLinks(body).trim();
    if (flat.length === 0) return null;
    const match = flat.match(/^.*?[.!?](\s|$)/);
    const first = match ? match[0].trim() : flat;
    return first.length > 240 ? first.slice(0, 237).trimEnd() + '…' : first;
  }
  return null;
}

/**
 * Resolve an article's fully-derived `meta.wiki` view. This is the ONLY
 * function downstream consumers should call to read wiki metadata.
 *
 * Explicit author-provided values always win; derived values fill gaps.
 * The returned object is frozen to prevent accidental mutation by callers.
 *
 * @param {object | null | undefined} article
 * @returns {WikiMetaDerived}
 */
export function deriveWikiMeta(article) {
  const wiki = /** @type {WikiMetaInput} */ (article?.meta?.wiki ?? {});

  const lastUpdatedISO = isValidISODate(wiki.lastUpdatedISO)
    ? /** @type {string} */ (wiki.lastUpdatedISO)
    : null;

  const authors = normalizeAuthors(wiki.authors);
  const tags = normalizeTags(wiki.tags);

  const wordCount =
    typeof wiki.wordCount === 'number' && Number.isFinite(wiki.wordCount) && wiki.wordCount >= 0
      ? Math.round(wiki.wordCount)
      : countWordsInArticle(article);

  const readingTimeMinutes =
    typeof wiki.readingTimeMinutes === 'number' &&
    Number.isFinite(wiki.readingTimeMinutes) &&
    wiki.readingTimeMinutes > 0
      ? Math.max(1, Math.round(wiki.readingTimeMinutes))
      : estimateReadingMinutes(wordCount);

  const toc = wiki.toc === 'off' ? 'off' : 'auto';

  const infobox =
    wiki.infobox && typeof wiki.infobox === 'object' && !Array.isArray(wiki.infobox)
      ? { .../** @type {Record<string, string>} */ (wiki.infobox) }
      : {};

  return Object.freeze({
    lastUpdatedISO,
    formattedUpdated: formatUpdatedDate(lastUpdatedISO),
    authors,
    wordCount,
    readingTimeMinutes,
    tags,
    summary: deriveSummary(article),
    toc,
    infobox,
  });
}
