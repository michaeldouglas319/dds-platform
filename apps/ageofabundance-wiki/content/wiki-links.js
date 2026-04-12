/**
 * Wiki-link parser.
 *
 * Parses `[[Page Name]]` and `[[slug|Display Text]]` syntax inside plain
 * text strings and resolves each reference against the known article
 * dataset. Returns a structured representation of text segments and link
 * tokens that the rendering layer can map to React elements.
 *
 * Design decisions:
 * - Resolution is case-insensitive and normalizes spaces/underscores to
 *   hyphens so `[[Energy Abundance]]` resolves to `energy-abundance`.
 * - Only the first `|` is treated as a pipe separator; display text may
 *   contain additional pipes.
 * - Empty brackets `[[]]` are left as literal text.
 * - The parser is pure: no side effects, no React dependency. It can be
 *   called at build time or runtime.
 */

import { listArticleSlugs } from './articles.js';

/**
 * Normalize a title or free-form string into a slug.
 *
 * `Energy Abundance` → `energy-abundance`
 * `some_thing  weird` → `some-thing-weird`
 *
 * @param {string} raw
 * @returns {string}
 */
export function titleToSlug(raw) {
  return raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')        // drop non-word chars (except space/hyphen)
    .replace(/[\s_]+/g, '-')         // spaces + underscores → single hyphen
    .replace(/-+/g, '-')             // collapse consecutive hyphens
    .replace(/^-|-$/g, '');          // trim leading/trailing hyphens
}

/**
 * @typedef {'text' | 'wiki-link'} SegmentType
 *
 * @typedef {Object} TextSegment
 * @property {'text'} type
 * @property {string} value
 *
 * @typedef {Object} WikiLinkSegment
 * @property {'wiki-link'} type
 * @property {string} slug       — Resolved slug (always lowercase kebab).
 * @property {string} display    — Display text shown to the reader.
 * @property {boolean} exists    — Whether the slug resolves to a known article.
 * @property {string} href       — Full href (`/a/<slug>`).
 *
 * @typedef {TextSegment | WikiLinkSegment} Segment
 */

/** @type {RegExp} Matches `[[...]]` with a non-greedy interior. */
const WIKI_LINK_RE = /\[\[([^\]]+)\]\]/g;

/**
 * Parse a text string containing wiki-link syntax into an array of
 * segments.
 *
 * @param {string} text     — Raw text (may contain `[[…]]` markers).
 * @param {Set<string>} [knownSlugs] — Set of valid slugs. When omitted
 *   the function builds one from the article dataset.
 * @returns {Segment[]}
 */
export function parseWikiLinks(text, knownSlugs) {
  if (!text) return [];

  const slugSet = knownSlugs ?? new Set(listArticleSlugs());

  /** @type {Segment[]} */
  const segments = [];
  let lastIndex = 0;

  // Reset lastIndex — .test() in hasWikiLinks may have advanced it, and
  // matchAll clones the regex with the *current* lastIndex per spec.
  WIKI_LINK_RE.lastIndex = 0;

  for (const match of text.matchAll(WIKI_LINK_RE)) {
    const fullMatch = match[0];
    const inner = match[1];
    const offset = /** @type {number} */ (match.index);

    // Push any preceding plain text.
    if (offset > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, offset) });
    }

    // Split on the FIRST pipe only.
    const pipeIdx = inner.indexOf('|');
    const rawSlug = pipeIdx === -1 ? inner : inner.slice(0, pipeIdx);
    const display = pipeIdx === -1 ? inner.trim() : inner.slice(pipeIdx + 1).trim();

    const slug = titleToSlug(rawSlug);

    // Skip empty slug (degenerate `[[]]` or `[[|foo]]`).
    if (!slug) {
      segments.push({ type: 'text', value: fullMatch });
      lastIndex = offset + fullMatch.length;
      continue;
    }

    segments.push({
      type: 'wiki-link',
      slug,
      display: display || slug,
      exists: slugSet.has(slug),
      href: `/a/${slug}`,
    });

    lastIndex = offset + fullMatch.length;
  }

  // Trailing plain text.
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}

/**
 * Check whether a text string contains any wiki-link markers.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function hasWikiLinks(text) {
  if (!text) return false;
  WIKI_LINK_RE.lastIndex = 0;
  return WIKI_LINK_RE.test(text);
}

/**
 * Collect all broken (unresolved) wiki-links from a text string.
 * Useful for build-time validation and warnings.
 *
 * @param {string} text
 * @param {Set<string>} [knownSlugs]
 * @returns {{ slug: string, display: string }[]}
 */
export function findBrokenLinks(text, knownSlugs) {
  return parseWikiLinks(text, knownSlugs)
    .filter((s) => s.type === 'wiki-link' && !s.exists)
    .map((s) => ({ slug: /** @type {WikiLinkSegment} */ (s).slug, display: /** @type {WikiLinkSegment} */ (s).display }));
}
