/**
 * Wiki-link parser + resolver.
 *
 * Recognizes the universal wiki-link syntax used by Obsidian, MediaWiki,
 * remark-wiki-link, Foam, Dendron, etc.:
 *
 *   [[Target]]                 — bare target, display = target
 *   [[target-slug]]            — slug target, display = target
 *   [[target|Display Text]]    — aliased target with explicit display text
 *
 * The output is a flat token stream (`text` | `link`) that downstream
 * renderers can trivially map to React nodes. All parsing is pure,
 * deterministic, and safe to call at build time — there is no runtime
 * cost on the client.
 *
 * ## Backward compatibility
 * - This module is additive. Articles that contain no `[[…]]` syntax
 *   parse as a single `text` token and render unchanged.
 * - `@dds/types` is untouched; `meta` remains `Record<string, unknown>`.
 * - The resolver accepts either a slug (`coordination-abundance`) or a
 *   title (`Coordination Abundance`) — both resolve to the same article.
 *
 * ## Broken links ("redlinks")
 * Unresolved targets are NOT silently dropped. They become `link` tokens
 * with `exists: false`, so the renderer can surface them as a distinct
 * visual state. Missing-but-intentional links are a genuine wiki feature
 * (Wikipedia redlinks): they signal to the editorial community that an
 * article should exist.
 *
 * @typedef {{ type: 'text', value: string }} WikiTextToken
 * @typedef {{
 *   type: 'link',
 *   raw: string,
 *   target: string,
 *   slug: string,
 *   display: string,
 *   exists: boolean,
 * }} WikiLinkToken
 * @typedef {WikiTextToken | WikiLinkToken} WikiToken
 */

/**
 * Capture every `[[...]]` occurrence. The inner body must not contain
 * literal `[` or `]` so we don't greedily swallow adjacent links. The
 * regex is global + sticky-free so we can walk it with `exec` inside
 * `parseWikiLinks`.
 */
const WIKI_LINK_PATTERN = /\[\[([^\[\]\n]+?)\]\]/g;

/**
 * Normalize a raw wiki-link target to a URL slug.
 *
 * - Trims whitespace
 * - Lowercases
 * - Treats `_` and whitespace as word separators → `-`
 * - Drops any characters outside `[a-z0-9-]`
 * - Collapses consecutive `-` and strips leading/trailing `-`
 *
 * Empty or non-string input yields `''`.
 *
 * @param {unknown} target
 * @returns {string}
 */
export function slugifyTarget(target) {
  if (typeof target !== 'string') return '';
  const lowered = target.trim().toLowerCase();
  if (lowered.length === 0) return '';
  return lowered
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Tokenize a string of prose into alternating text and link tokens.
 *
 * The returned array always concatenates back to the original input when
 * only `value`/`raw` fields are considered, so callers can round-trip
 * text that contains no wiki links without surprises.
 *
 * At parse time the resolver is not yet known, so every link token is
 * emitted with `exists: false` and `slug` set to the slugified target.
 * Downstream resolution fills in the real `exists` flag.
 *
 * @param {unknown} text
 * @returns {WikiToken[]}
 */
export function parseWikiLinks(text) {
  if (typeof text !== 'string' || text.length === 0) return [];

  /** @type {WikiToken[]} */
  const tokens = [];
  let cursor = 0;
  WIKI_LINK_PATTERN.lastIndex = 0;

  for (;;) {
    const match = WIKI_LINK_PATTERN.exec(text);
    if (!match) break;

    if (match.index > cursor) {
      tokens.push({ type: 'text', value: text.slice(cursor, match.index) });
    }

    const inner = match[1];
    const pipeIdx = inner.indexOf('|');
    const rawTarget = pipeIdx >= 0 ? inner.slice(0, pipeIdx) : inner;
    const rawDisplay = pipeIdx >= 0 ? inner.slice(pipeIdx + 1) : inner;
    const target = rawTarget.trim();
    const display = rawDisplay.trim();
    const slug = slugifyTarget(target);

    // Degenerate case: `[[ ]]` or `[[|foo]]` — round-trip as text so we
    // never silently drop authored content.
    if (slug.length === 0) {
      tokens.push({ type: 'text', value: match[0] });
    } else {
      tokens.push({
        type: 'link',
        raw: match[0],
        target,
        slug,
        display: display.length > 0 ? display : target,
        exists: false,
      });
    }

    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    tokens.push({ type: 'text', value: text.slice(cursor) });
  }

  return tokens;
}

/**
 * Build a lookup resolver from an array of UniversalSection-shaped wiki
 * articles. The resolver recognizes:
 *
 *   1. the canonical slug (article.id)
 *   2. the title, slugified (e.g. "Coordination Abundance"
 *      → "coordination-abundance")
 *
 * Both keys map to the same underlying article. The returned function is
 * safe to call with any user-authored target string.
 *
 * @param {Array<{ id?: string, subject?: { title?: string } }>} articles
 */
export function createWikiLinkResolver(articles) {
  /** @type {Map<string, { slug: string, title: string }>} */
  const index = new Map();
  const list = Array.isArray(articles) ? articles : [];
  for (const article of list) {
    if (!article || typeof article.id !== 'string') continue;
    const slug = article.id;
    const title = article.subject?.title ?? slug;
    // Canonical slug key.
    index.set(slug, { slug, title });
    // Title-derived key (so authors can write "[[Coordination Abundance]]").
    const titleSlug = slugifyTarget(title);
    if (titleSlug && !index.has(titleSlug)) {
      index.set(titleSlug, { slug, title });
    }
  }

  /**
   * @param {string} rawTarget
   * @returns {{ slug: string, exists: boolean, title: string | null }}
   */
  function resolve(rawTarget) {
    const slug = slugifyTarget(rawTarget);
    if (!slug) return { slug: '', exists: false, title: null };
    const hit = index.get(slug);
    if (hit) return { slug: hit.slug, exists: true, title: hit.title };
    return { slug, exists: false, title: null };
  }

  return { resolve };
}

/**
 * Flatten wiki-link syntax to its display text. Used by word-count and
 * summary derivation so `[[energy-abundance|energy]]` contributes
 * "energy" (one word) rather than the literal 3-token bracket form, and
 * so raw `[[…]]` syntax never leaks into OG/JSON-LD description fields.
 *
 * @param {unknown} text
 * @returns {string}
 */
export function stripWikiLinks(text) {
  if (typeof text !== 'string' || text.length === 0) return '';
  const tokens = parseWikiLinks(text);
  if (tokens.length === 0) return '';
  return tokens.map((t) => (t.type === 'text' ? t.value : t.display)).join('');
}

/**
 * Convenience: parse + resolve in one call, returning a token stream
 * with each link token carrying a final `exists` flag and the canonical
 * target slug. Downstream renderers typically call this, not the raw
 * parser.
 *
 * @param {unknown} text
 * @param {{ resolve: (raw: string) => { slug: string, exists: boolean, title: string | null } }} resolver
 * @returns {WikiToken[]}
 */
export function resolveWikiLinks(text, resolver) {
  const tokens = parseWikiLinks(text);
  if (!resolver || typeof resolver.resolve !== 'function') return tokens;
  return tokens.map((token) => {
    if (token.type !== 'link') return token;
    const resolved = resolver.resolve(token.target);
    return {
      ...token,
      slug: resolved.slug || token.slug,
      exists: resolved.exists,
    };
  });
}
