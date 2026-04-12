/**
 * Wiki-link parser.
 *
 * Recognizes `[[Page Name]]` and `[[slug|Display Text]]` inside plain-text
 * strings and resolves them to internal `/a/<slug>` links at render time.
 *
 * - `[[Age of Abundance]]`       → `/a/age-of-abundance` with display "Age of Abundance"
 * - `[[energy-abundance|cheap energy]]` → `/a/energy-abundance` with display "cheap energy"
 *
 * Unresolvable slugs produce a broken-link span so editors can see and fix
 * them. The parser is intentionally stateless — it takes a set of known
 * slugs and returns results. No globals, no side-effects.
 *
 * For the future backlinks feature, {@link extractWikiLinks} returns raw
 * link data without rendering, and {@link buildWikiLinkGraph} inverts the
 * link map across all articles.
 */

/**
 * Regex for wiki-link syntax. Captures:
 *   Group 1: target (either a slug or a page name)
 *   Group 2: display text (optional, after the `|`)
 *
 * Does NOT match across newlines or inside backtick code spans (handled
 * by the caller splitting on code fences first — not needed yet since
 * our content has no inline code).
 */
const WIKI_LINK_RE = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;

/**
 * Normalize a page name or raw target into a URL-safe slug.
 *
 *   "Age of Abundance"   → "age-of-abundance"
 *   "  Energy Abundance " → "energy-abundance"
 *   "energy-abundance"    → "energy-abundance"   (no-op if already a slug)
 *
 * @param {string} raw
 * @returns {string}
 */
export function toSlug(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * @typedef {Object} WikiLinkMatch
 * @property {string} slug       — normalized slug for the target article
 * @property {string} display    — display text for the link
 * @property {boolean} exists    — true if `slug` is in `knownSlugs`
 * @property {number} start      — char offset of `[[` in the source string
 * @property {number} end        — char offset after `]]` in the source string
 */

/**
 * Extract raw wiki-link data from a plain-text string.
 *
 * @param {string} text           — source text containing `[[…]]` links
 * @param {Set<string>} knownSlugs — the set of article slugs that exist
 * @returns {WikiLinkMatch[]}
 */
export function extractWikiLinks(text, knownSlugs) {
  if (!text) return [];

  const matches = [];
  let m;
  WIKI_LINK_RE.lastIndex = 0;
  while ((m = WIKI_LINK_RE.exec(text)) !== null) {
    const target = m[1].trim();
    const display = m[2]?.trim() || target;
    const slug = toSlug(target);
    matches.push({
      slug,
      display,
      exists: knownSlugs.has(slug),
      start: m.index,
      end: m.index + m[0].length,
    });
  }
  return matches;
}

/**
 * Build an inverted link graph for the backlinks feature.
 *
 * Returns a Map where each key is an article slug and the value is a Set of
 * slugs that link TO that article. Example: if "age-of-abundance" links to
 * "energy-abundance", the graph will contain:
 *
 *   "energy-abundance" → Set(["age-of-abundance"])
 *
 * @param {{ id: string, content?: { body?: string, paragraphs?: { subtitle?: string, description?: string }[] } }[]} articles
 * @returns {Map<string, Set<string>>}
 */
export function buildWikiLinkGraph(articles) {
  const slugSet = new Set(articles.map((a) => a.id));
  /** @type {Map<string, Set<string>>} */
  const graph = new Map();

  // Initialize every slug with an empty set
  for (const slug of slugSet) {
    graph.set(slug, new Set());
  }

  for (const article of articles) {
    const texts = collectArticleTexts(article);
    for (const text of texts) {
      const links = extractWikiLinks(text, slugSet);
      for (const link of links) {
        if (link.exists) {
          const backlinks = graph.get(link.slug);
          if (backlinks) {
            backlinks.add(article.id);
          }
        }
      }
    }
  }
  return graph;
}

/**
 * Collect all text fields from an article that may contain wiki-links.
 *
 * @param {{ content?: { body?: string, paragraphs?: { subtitle?: string, description?: string }[] } }} article
 * @returns {string[]}
 */
function collectArticleTexts(article) {
  const texts = [];
  if (article?.content?.body) texts.push(article.content.body);
  for (const p of article?.content?.paragraphs ?? []) {
    if (p.subtitle) texts.push(p.subtitle);
    if (p.description) texts.push(p.description);
  }
  return texts;
}

/**
 * Collect all outgoing wiki-link slugs from a single article.
 *
 * @param {{ content?: { body?: string, paragraphs?: { subtitle?: string, description?: string }[] } }} article
 * @param {Set<string>} knownSlugs
 * @returns {{ slug: string, exists: boolean }[]}
 */
export function collectArticleLinks(article, knownSlugs) {
  const seen = new Set();
  const results = [];
  const texts = collectArticleTexts(article);
  for (const text of texts) {
    for (const link of extractWikiLinks(text, knownSlugs)) {
      if (!seen.has(link.slug)) {
        seen.add(link.slug);
        results.push({ slug: link.slug, exists: link.exists });
      }
    }
  }
  return results;
}
