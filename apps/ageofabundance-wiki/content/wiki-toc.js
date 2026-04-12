/**
 * Table-of-contents helpers.
 *
 * Extracts heading entries from a UniversalSection article's `content.paragraphs`
 * array, generating stable slug IDs suitable for anchor links. Pure functions,
 * safe for build-time and RSC use.
 *
 * @typedef {Object} TocEntry
 * @property {string} id   Slug ID for the anchor (e.g. "core-pillars").
 * @property {string} text Heading text as displayed (e.g. "Core pillars").
 * @property {number} level Heading level (2 for h2, 3 for h3, etc.).
 */

/**
 * Convert a heading string to a URL-safe slug.
 * Strips non-alphanumeric characters and collapses whitespace to hyphens.
 *
 * @param {string} text
 * @returns {string}
 */
export function slugifyHeading(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract TOC entries from an article's `content.paragraphs`.
 *
 * Each paragraph with a non-empty `subtitle` produces a level-2 heading entry.
 * (Level-3 support is reserved for a future MDX pipeline where paragraphs can
 * contain nested subheadings.)
 *
 * @param {object | null | undefined} article
 * @returns {TocEntry[]}
 */
export function extractTocEntries(article) {
  const paragraphs = article?.content?.paragraphs;
  if (!Array.isArray(paragraphs)) return [];

  /** @type {TocEntry[]} */
  const entries = [];
  /** Track used slugs to avoid collisions */
  const used = new Set();

  for (const p of paragraphs) {
    if (!p || typeof p.subtitle !== 'string') continue;
    const text = p.subtitle.trim();
    if (text.length === 0) continue;

    let id = slugifyHeading(text);
    if (used.has(id)) {
      let n = 2;
      while (used.has(`${id}-${n}`)) n++;
      id = `${id}-${n}`;
    }
    used.add(id);

    entries.push({ id, text, level: 2 });
  }

  return entries;
}
