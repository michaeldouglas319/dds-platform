/**
 * Table of contents utilities for wiki articles.
 *
 * Build-time safe. Deterministic. No side effects.
 * Consumed by the WikiToc RSC and by wiki-article.jsx to stamp heading IDs.
 */

/**
 * Slugify a heading string into a URL-safe anchor ID.
 * Deterministic — same input always produces same output.
 *
 * @param {string} text
 * @returns {string}
 */
export function slugifyHeading(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract table-of-contents entries from article paragraphs.
 * Handles duplicate heading text by appending a numeric suffix.
 * Returns an empty array for articles with no subtitled paragraphs.
 *
 * @param {Array<{ subtitle?: string } | null | undefined>} paragraphs
 * @returns {Array<{ id: string, text: string }>}
 */
export function buildTocEntries(paragraphs) {
  /** @type {Array<{ id: string, text: string }>} */
  const entries = [];
  /** @type {Map<string, number>} */
  const seen = new Map();

  for (const p of paragraphs ?? []) {
    if (!p || typeof p.subtitle !== 'string') continue;
    const text = p.subtitle.trim();
    if (!text) continue;

    const base = slugifyHeading(text);
    if (!base) continue;

    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count}`;
    entries.push({ id, text });
  }

  return entries;
}
