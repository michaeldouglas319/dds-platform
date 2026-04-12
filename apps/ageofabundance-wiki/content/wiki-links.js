/**
 * Wiki-link parser.
 *
 * Parses `[[Page Name]]` and `[[slug|Display Text]]` syntax in plain-text
 * strings and resolves them against the article slug index at build time.
 *
 * Design decisions:
 * - Pure functions, no side effects — safe for RSC and static generation.
 * - Regex-based, not AST — article content is plain strings, not Markdown.
 * - Returns a segment array so the caller (WikiText component) can map
 *   segments to React elements without dangerouslySetInnerHTML.
 * - Broken links are flagged with `resolved: false` so the UI can render
 *   a distinct visual state (dashed underline, muted color, title tooltip).
 * - `buildLinkGraph` inverts outbound links for future backlinks panel.
 */

import { articles } from './articles.js';

// ─── Slug index ───────────────────────────────────────────────────

/** @type {Set<string>} */
let _slugIndex = null;

/**
 * Lazily-built set of all known article slugs.
 * Cached — the seed dataset is static.
 */
export function getSlugIndex() {
  if (!_slugIndex) {
    _slugIndex = new Set(articles.map((a) => a.id));
  }
  return _slugIndex;
}

// ─── Slugify ──────────────────────────────────────────────────────

/**
 * Convert a human-readable page name to a URL slug.
 *
 * "Energy Abundance" → "energy-abundance"
 * "age-of-abundance" → "age-of-abundance" (already a slug — no-op)
 *
 * @param {string} name
 * @returns {string}
 */
export function slugify(name) {
  if (typeof name !== 'string') return '';
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Parse ────────────────────────────────────────────────────────

/**
 * @typedef {{ type: 'text', value: string }} TextSegment
 * @typedef {{ type: 'wiki-link', slug: string, display: string, resolved: boolean }} WikiLinkSegment
 * @typedef {TextSegment | WikiLinkSegment} Segment
 */

/**
 * Wiki-link regex.
 *
 * Matches `[[target]]` or `[[target|display text]]`.
 * - `target` is trimmed, then slugified to look up in the index.
 * - `display` defaults to the raw target text if the pipe is absent.
 * - Nested brackets are not supported (no wiki nests links).
 */
const WIKI_LINK_RE = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;

/**
 * Parse a plain-text string containing wiki-link syntax into an array
 * of text and wiki-link segments.
 *
 * @param {string} text  — raw article text
 * @param {Set<string>} [slugIndex]  — known slugs; defaults to full index
 * @returns {Segment[]}
 */
export function parseWikiText(text, slugIndex) {
  if (typeof text !== 'string' || text.length === 0) return [];

  const index = slugIndex ?? getSlugIndex();
  /** @type {Segment[]} */
  const segments = [];
  let lastIndex = 0;

  // Reset regex state (global flag)
  WIKI_LINK_RE.lastIndex = 0;

  let match;
  while ((match = WIKI_LINK_RE.exec(text)) !== null) {
    const [full, rawTarget, rawDisplay] = match;
    const start = match.index;

    // Push preceding text
    if (start > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, start) });
    }

    const slug = slugify(rawTarget);
    const display = (rawDisplay ?? rawTarget).trim();
    const resolved = slug.length > 0 && index.has(slug);

    segments.push({ type: 'wiki-link', slug, display, resolved });

    lastIndex = start + full.length;
  }

  // Push trailing text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}

/**
 * Quick check: does a text string contain any wiki-link syntax?
 *
 * @param {string} text
 * @returns {boolean}
 */
export function hasWikiLinks(text) {
  if (typeof text !== 'string') return false;
  WIKI_LINK_RE.lastIndex = 0;
  return WIKI_LINK_RE.test(text);
}

// ─── Strip ────────────────────────────────────────────────────────

/**
 * Strip wiki-link syntax from text, leaving only the visible display text.
 *
 * `[[Energy Abundance]]` → `Energy Abundance`
 * `[[slug|Display Text]]` → `Display Text`
 *
 * Used by the word counter so bracket syntax doesn't inflate the count.
 *
 * @param {string} text
 * @returns {string}
 */
export function stripWikiLinks(text) {
  if (typeof text !== 'string') return text ?? '';
  WIKI_LINK_RE.lastIndex = 0;
  return text.replace(WIKI_LINK_RE, (_match, target, display) =>
    (display ?? target).trim(),
  );
}

// ─── Link graph ───────────────────────────────────────────────────

/**
 * Build an outbound link map: { articleSlug → [targetSlug, ...] }.
 *
 * Scans `content.body` and every `content.paragraphs[].description`
 * for wiki-link syntax. Only resolved links are included.
 *
 * @param {import('./articles.js').WikiArticle[]} [articleList]
 * @returns {Record<string, string[]>}
 */
export function buildOutboundLinks(articleList) {
  const list = articleList ?? articles;
  const index = getSlugIndex();
  /** @type {Record<string, string[]>} */
  const graph = {};

  for (const article of list) {
    const targets = new Set();
    const texts = [
      article.content?.body,
      ...(article.content?.paragraphs ?? []).map((p) => p.description),
    ].filter(Boolean);

    for (const text of texts) {
      const segments = parseWikiText(text, index);
      for (const seg of segments) {
        if (seg.type === 'wiki-link' && seg.resolved) {
          targets.add(seg.slug);
        }
      }
    }

    graph[article.id] = [...targets];
  }

  return graph;
}

/**
 * Invert the outbound link graph to get backlinks:
 * { targetSlug → [sourceSlug, ...] }.
 *
 * @param {Record<string, string[]>} outbound
 * @returns {Record<string, string[]>}
 */
export function buildBacklinks(outbound) {
  /** @type {Record<string, string[]>} */
  const backlinks = {};

  for (const [source, targets] of Object.entries(outbound)) {
    for (const target of targets) {
      if (!backlinks[target]) backlinks[target] = [];
      if (!backlinks[target].includes(source)) {
        backlinks[target].push(source);
      }
    }
  }

  return backlinks;
}

/**
 * Get enriched backlink data for a specific article slug.
 *
 * Builds the full outbound → backlink graph, then looks up and enriches
 * each source article with its title and summary. Safe for RSC — pure
 * function, deterministic, no side effects.
 *
 * @param {string} slug  — the target article slug
 * @returns {{ slug: string, title: string, summary: string }[]}
 */
export function getBacklinksForSlug(slug) {
  const outbound = buildOutboundLinks();
  const backlinksMap = buildBacklinks(outbound);
  const linking = backlinksMap[slug] ?? [];

  return linking.map((sourceSlug) => {
    const article = articles.find((a) => a.id === sourceSlug);
    return {
      slug: sourceSlug,
      title: article?.subject?.title ?? sourceSlug,
      summary:
        article?.meta?.wiki?.summary ??
        article?.subject?.summary ??
        article?.subject?.subtitle ??
        '',
    };
  });
}
