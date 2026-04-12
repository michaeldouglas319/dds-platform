/**
 * Wiki-link parser.
 *
 * Parses `[[Page Name]]` and `[[slug|Display Text]]` syntax inside plain
 * text and resolves each link against a set of known article slugs. Links
 * whose target slug does not exist are flagged as broken so the renderer
 * can apply a distinct visual treatment (the classic Wikipedia "redlink").
 *
 * Design constraints:
 * - Pure functions, no side effects, no external deps.
 * - Works in RSC (server components) — no DOM, no hooks.
 * - Returns structured segments so the consumer (WikiText component)
 *   decides how to render (React elements, HTML string, etc.).
 */

/**
 * Convert a human-readable page name to a URL-safe slug.
 *
 * "Age of Abundance" → "age-of-abundance"
 * "Energy & Compute"  → "energy--compute" (& stripped, double-dash collapsed)
 *
 * @param {string} name
 * @returns {string}
 */
export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // strip non-word chars except spaces & hyphens
    .replace(/\s+/g, '-')     // spaces → hyphens
    .replace(/-{2,}/g, '-')   // collapse runs of hyphens
    .replace(/^-|-$/g, '');   // trim leading/trailing hyphens
}

/**
 * @typedef {Object} TextSegment
 * @property {'text'} type
 * @property {string} value
 */

/**
 * @typedef {Object} WikiLinkSegment
 * @property {'wikilink'} type
 * @property {string} slug      - resolved slug for the link target
 * @property {string} display   - text the user sees
 * @property {boolean} exists   - true when slug matches a known article
 */

/** @typedef {TextSegment | WikiLinkSegment} Segment */

/**
 * The wiki-link regex.
 *
 * Matches `[[…]]` where the content inside does NOT contain `]`.
 * The captured group is split on `|` to separate slug from display text.
 *
 * @type {RegExp}
 */
const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;

/**
 * Parse a plain-text string into an array of text and wiki-link segments.
 *
 * @param {string} text         - raw text that may contain wiki-links
 * @param {Set<string>} knownSlugs - slugs of articles that exist
 * @returns {Segment[]}
 */
export function parseWikiText(text, knownSlugs) {
  if (!text || typeof text !== 'string') return [{ type: 'text', value: text ?? '' }];

  /** @type {Segment[]} */
  const segments = [];
  let lastIndex = 0;

  // Reset the regex (global flag means it's stateful)
  WIKILINK_RE.lastIndex = 0;

  let match;
  while ((match = WIKILINK_RE.exec(text)) !== null) {
    // Push any plain text before this match
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    const inner = match[1].trim();
    const pipeIndex = inner.indexOf('|');

    let slug;
    let display;

    if (pipeIndex !== -1) {
      // [[Page Name|Display Text]] — slug derived from left side, alias from right
      const rawSlug = inner.slice(0, pipeIndex).trim();
      slug = rawSlug.includes(' ') ? slugify(rawSlug) : rawSlug;
      display = inner.slice(pipeIndex + 1).trim();
    } else {
      // [[Page Name]] — slugify the page name, display as-is
      display = inner;
      slug = slugify(inner);
    }

    segments.push({
      type: 'wikilink',
      slug,
      display: display || slug,
      exists: knownSlugs.has(slug),
    });

    lastIndex = match.index + match[0].length;
  }

  // Push any remaining plain text after the last match
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  // If nothing was parsed (no wiki-links), return a single text segment
  if (segments.length === 0) {
    segments.push({ type: 'text', value: text });
  }

  return segments;
}

/**
 * Collect every wiki-link slug referenced across all articles.
 * Useful for build-time broken-link reports.
 *
 * @param {Array<{ content?: { body?: string, paragraphs?: Array<{ subtitle?: string, description?: string }> } }>} articles
 * @returns {{ slug: string, display: string, sourceArticleId: string }[]}
 */
export function extractAllWikiLinks(articles) {
  const links = [];
  const dummySlugs = new Set(); // we don't need existence check here

  for (const article of articles) {
    const textsToScan = [];
    if (article.content?.body) textsToScan.push(article.content.body);
    for (const p of article.content?.paragraphs ?? []) {
      if (p.description) textsToScan.push(p.description);
    }

    for (const text of textsToScan) {
      const segments = parseWikiText(text, dummySlugs);
      for (const seg of segments) {
        if (seg.type === 'wikilink') {
          links.push({
            slug: seg.slug,
            display: seg.display,
            sourceArticleId: article.id,
          });
        }
      }
    }
  }

  return links;
}

/**
 * Build the set of known article slugs from the articles array.
 *
 * @param {Array<{ id: string }>} articles
 * @returns {Set<string>}
 */
export function buildSlugSet(articles) {
  return new Set(articles.map((a) => a.id));
}
