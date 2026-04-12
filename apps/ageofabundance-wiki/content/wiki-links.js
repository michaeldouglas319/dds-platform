/**
 * Wiki-link parser — `[[Page Name]]` and `[[slug|Display Text]]` rewriter.
 *
 * Parses wiki-link syntax from plain-text content strings, normalizes
 * slugs, and resolves targets against the known article set at build time.
 * Broken links (targets that don't map to an existing article) are flagged
 * so the renderer can apply a distinct visual + a11y state.
 *
 * The module is pure-functional and side-effect-free — safe to call during
 * SSR / static generation. It never mutates its inputs.
 *
 * Syntax (matches MediaWiki / Obsidian conventions):
 *   [[Page Name]]           → slug "page-name", display "Page Name"
 *   [[slug|Display Text]]   → slug "slug",      display "Display Text"
 */

/**
 * Regex for matching wiki-links: `[[target]]` or `[[target|display]]`.
 *
 * Capture groups:
 *   1 — target (page name or explicit slug)
 *   2 — display text (optional; everything after the first `|`)
 *
 * The pattern disallows `[`, `]`, and `\n` inside the brackets to avoid
 * runaway matches. Nested brackets are not valid wiki-link syntax.
 */
const WIKI_LINK_RE = /\[\[([^\[\]\n|]+?)(?:\|([^\[\]\n]+?))?\]\]/g;

/**
 * Normalize a page name into a URL-safe slug.
 *
 * - Trim whitespace
 * - Lowercase
 * - Replace whitespace runs with a single hyphen
 * - Strip everything that isn't a-z, 0-9, or hyphen
 * - Collapse consecutive hyphens
 * - Strip leading/trailing hyphens
 *
 * @param {string} name  Raw page name from inside `[[…]]`.
 * @returns {string}      URL-safe slug (may be empty for pathological input).
 */
export function normalizeWikiSlug(name) {
  if (typeof name !== 'string') return '';
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * @typedef {Object} ParsedWikiLink
 * @property {string} raw      The full matched string (e.g. `[[Energy Abundance]]`).
 * @property {string} target   The raw target text before normalization.
 * @property {string} slug     Normalized slug derived from `target`.
 * @property {string} display  Display text — explicit if `|` was used, else `target` trimmed.
 * @property {number} index    Character offset in the source string.
 */

/**
 * Extract all wiki-links from a text string.
 *
 * @param {string} text  Source text that may contain `[[…]]` wiki-links.
 * @returns {ParsedWikiLink[]}  Ordered list of parsed wiki-links.
 */
export function parseWikiLinks(text) {
  if (typeof text !== 'string') return [];

  /** @type {ParsedWikiLink[]} */
  const links = [];
  // Reset lastIndex in case the regex was used elsewhere.
  WIKI_LINK_RE.lastIndex = 0;

  let match;
  while ((match = WIKI_LINK_RE.exec(text)) !== null) {
    const target = match[1].trim();
    const display = match[2] ? match[2].trim() : target;
    const slug = normalizeWikiSlug(target);
    if (slug.length === 0) continue; // degenerate input; skip silently

    links.push({
      raw: match[0],
      target,
      slug,
      display,
      index: match.index,
    });
  }

  return links;
}

/**
 * @typedef {Object} ResolvedWikiLink
 * @property {string} raw
 * @property {string} target
 * @property {string} slug
 * @property {string} display
 * @property {number} index
 * @property {boolean} exists  `true` when `slug` is in `knownSlugs`.
 * @property {string} href     `/a/<slug>` for existing targets; `''` for broken.
 */

/**
 * Parse wiki-links and resolve each against a set of known article slugs.
 *
 * @param {string} text        Source text containing wiki-links.
 * @param {Set<string>} knownSlugs  Set of valid article slugs.
 * @returns {ResolvedWikiLink[]}
 */
export function resolveWikiLinks(text, knownSlugs) {
  const parsed = parseWikiLinks(text);
  return parsed.map((link) => {
    const exists = knownSlugs.has(link.slug);
    return {
      ...link,
      exists,
      href: exists ? `/a/${link.slug}` : '',
    };
  });
}

/**
 * Split a text string into segments: plain text interspersed with resolved
 * wiki-links. This is the primary input for the WikiContent renderer.
 *
 * @param {string} text
 * @param {Set<string>} knownSlugs
 * @returns {Array<string | ResolvedWikiLink>}
 *   Alternating plain-text strings and ResolvedWikiLink objects. Leading or
 *   trailing empty strings are included for positional correctness but the
 *   renderer can skip them.
 */
export function segmentWikiContent(text, knownSlugs) {
  if (typeof text !== 'string' || text.length === 0) return [text ?? ''];
  const links = resolveWikiLinks(text, knownSlugs);
  if (links.length === 0) return [text];

  /** @type {Array<string | ResolvedWikiLink>} */
  const segments = [];
  let cursor = 0;

  for (const link of links) {
    // Plain text before this link
    if (link.index > cursor) {
      segments.push(text.slice(cursor, link.index));
    }
    segments.push(link);
    cursor = link.index + link.raw.length;
  }

  // Trailing plain text
  if (cursor < text.length) {
    segments.push(text.slice(cursor));
  }

  return segments;
}

/**
 * Build the outgoing wiki-link graph for all articles. Returns a Map from
 * article slug → array of outgoing ResolvedWikiLinks. Useful for computing
 * backlinks (invert this map) in a future session.
 *
 * @param {Array<{ id: string, content?: { body?: string, paragraphs?: Array<{ subtitle?: string, description?: string }> } }>} articles
 * @param {Set<string>} knownSlugs
 * @returns {Map<string, ResolvedWikiLink[]>}
 */
export function buildWikiLinkGraph(articles, knownSlugs) {
  /** @type {Map<string, ResolvedWikiLink[]>} */
  const graph = new Map();

  for (const article of articles) {
    /** @type {string[]} */
    const texts = [];
    if (typeof article.content?.body === 'string') {
      texts.push(article.content.body);
    }
    if (Array.isArray(article.content?.paragraphs)) {
      for (const p of article.content.paragraphs) {
        if (typeof p?.subtitle === 'string') texts.push(p.subtitle);
        if (typeof p?.description === 'string') texts.push(p.description);
      }
    }

    /** @type {ResolvedWikiLink[]} */
    const outgoing = [];
    for (const text of texts) {
      outgoing.push(...resolveWikiLinks(text, knownSlugs));
    }

    graph.set(article.id, outgoing);
  }

  return graph;
}

/**
 * Collect a Set of all known article slugs from the article array.
 * Convenience helper to avoid repeating `new Set(articles.map(…))`.
 *
 * @param {Array<{ id: string }>} articles
 * @returns {Set<string>}
 */
export function buildSlugSet(articles) {
  return new Set(articles.map((a) => a.id));
}
