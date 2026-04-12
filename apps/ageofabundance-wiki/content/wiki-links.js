/**
 * Wiki-link parser and resolver.
 *
 * Supports two syntaxes:
 *   [[Page Name]]          → resolves to /a/<slug>, displayed as "Page Name"
 *   [[slug|Display Text]]  → resolves to /a/<slug>, displayed as "Display Text"
 *
 * Resolution strategy:
 *   1. Exact slug match (e.g., [[energy-abundance]])
 *   2. Slugified match (e.g., [[Energy Abundance]] → energy-abundance)
 *   3. If neither resolves → broken link (exists: false)
 *
 * All functions are pure and side-effect-free. The module does NOT import
 * articles.js directly — callers pass the slug list in so this stays
 * testable without circular deps.
 */

/**
 * @typedef {{ type: 'text', value: string }} TextSegment
 * @typedef {{ type: 'wikilink', target: string, display: string }} WikiLinkSegment
 * @typedef {TextSegment | WikiLinkSegment} Segment
 */

/**
 * @typedef {{ slug: string, exists: boolean }} ResolvedLink
 */

/**
 * Convert a human-readable page name to a URL-safe slug.
 *
 * @param {string} target
 * @returns {string}
 */
export function slugify(target) {
  return target
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Parse wiki-link syntax from a plain-text string.
 *
 * Returns an ordered array of segments — plain text interspersed with
 * wiki-link references. Handles nested brackets gracefully by only
 * matching the innermost `[[…]]` pair.
 *
 * @param {string} text
 * @returns {Segment[]}
 */
export function parseWikiLinks(text) {
  if (!text || typeof text !== 'string') return [{ type: 'text', value: text ?? '' }];

  /** @type {Segment[]} */
  const segments = [];
  // Match [[target]] or [[target|display]] — non-greedy, no nested brackets
  const regex = /\[\[([^\[\]|]+?)(?:\|([^\[\]]+?))?\]\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    const target = match[1].trim();
    const display = match[2]?.trim() || target;
    segments.push({ type: 'wikilink', target, display });
    lastIndex = regex.lastIndex;
  }

  // Trailing text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  // If no wiki-links were found, return a single text segment
  if (segments.length === 0) {
    return [{ type: 'text', value: text }];
  }

  return segments;
}

/**
 * Resolve a wiki-link target against the known article slug list.
 *
 * @param {string} target  — raw target from [[target]] or [[target|display]]
 * @param {string[]} knownSlugs — all article slugs in the dataset
 * @returns {ResolvedLink}
 */
export function resolveWikiLink(target, knownSlugs) {
  // 1. Exact slug match
  if (knownSlugs.includes(target)) {
    return { slug: target, exists: true };
  }

  // 2. Slugified match
  const slug = slugify(target);
  if (knownSlugs.includes(slug)) {
    return { slug, exists: true };
  }

  // 3. Broken link
  return { slug: slug || slugify(target), exists: false };
}

/**
 * Extract every wiki-link target from an article's text content.
 *
 * Scans `content.body` and every `content.paragraphs[].description`.
 *
 * @param {Record<string, any>} article — a UniversalSection-shaped article
 * @returns {{ target: string, display: string }[]}
 */
export function extractLinksFromArticle(article) {
  /** @type {{ target: string, display: string }[]} */
  const links = [];

  const texts = [
    article?.content?.body,
    ...(article?.content?.paragraphs ?? []).map((p) => p.description),
  ].filter(Boolean);

  for (const text of texts) {
    const segments = parseWikiLinks(text);
    for (const seg of segments) {
      if (seg.type === 'wikilink') {
        links.push({ target: seg.target, display: seg.display });
      }
    }
  }

  return links;
}

/**
 * Build a forward link graph: articleSlug → Set of target slugs.
 *
 * @param {Record<string, any>[]} articles — full article dataset
 * @param {string[]} knownSlugs
 * @returns {Map<string, { slug: string, exists: boolean }[]>}
 */
export function buildLinkGraph(articles, knownSlugs) {
  /** @type {Map<string, { slug: string, exists: boolean }[]>} */
  const graph = new Map();

  for (const article of articles) {
    const id = article.id;
    const links = extractLinksFromArticle(article);
    const resolved = links.map((l) => resolveWikiLink(l.target, knownSlugs));
    graph.set(id, resolved);
  }

  return graph;
}

/**
 * Invert a forward link graph into a backlink map:
 * targetSlug → Set of source slugs that link to it.
 *
 * @param {Map<string, { slug: string, exists: boolean }[]>} forwardGraph
 * @returns {Map<string, string[]>}
 */
export function invertLinkGraph(forwardGraph) {
  /** @type {Map<string, Set<string>>} */
  const backlinks = new Map();

  for (const [sourceSlug, targets] of forwardGraph) {
    for (const { slug: targetSlug, exists } of targets) {
      if (!exists) continue; // skip broken links
      if (!backlinks.has(targetSlug)) {
        backlinks.set(targetSlug, new Set());
      }
      backlinks.get(targetSlug).add(sourceSlug);
    }
  }

  // Convert Sets to sorted arrays for stable rendering
  /** @type {Map<string, string[]>} */
  const result = new Map();
  for (const [slug, sources] of backlinks) {
    result.set(slug, [...sources].sort());
  }

  return result;
}
