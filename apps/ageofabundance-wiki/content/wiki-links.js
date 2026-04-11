/**
 * Wiki-link parser + cross-article graph.
 *
 * This module is the single source of truth for turning editorial
 * `[[...]]` markers inside article body text into semantic links. It is
 * deliberately framework-agnostic — no React imports, no DOM — so the
 * same output feeds RSC rendering, JSON-LD, search indexers, and the
 * upcoming backlinks panel without re-parsing.
 *
 * ## Supported syntax
 *
 * | Source                              | Target slug          | Visible text     |
 * | ----------------------------------- | -------------------- | ---------------- |
 * | `[[energy-abundance]]`              | `energy-abundance`   | `Energy Abundance` |
 * | `[[Energy Abundance]]`              | `energy-abundance`   | `Energy Abundance` |
 * | `[[energy abundance\|cheap power]]` | `energy-abundance`   | `cheap power`    |
 * | `[[coordination]]` (no article)     | —                    | `coordination` (rendered as broken) |
 *
 * The right side of a pipe is ALWAYS the visible text and the left side
 * is ALWAYS the target. We deliberately diverge from Obsidian's
 * `[[target|display]]` ordering in favor of MediaWiki's `[[display|target]]`
 * ordering because our editorial team is MediaWiki-trained and explicit
 * tests assert this contract. If that changes, flip {@link parseWikiLinks}.
 *
 * Wait — to avoid confusion: we follow MediaWiki's `[[target|display]]`:
 * the FIRST segment is the target slug, the SECOND is the visible text.
 * This matches `[[Help:Categories|category links]]` from Help:Links.
 *
 * ## Broken-link contract
 *
 * If the resolved slug does not exist in the known-article set, the
 * segment is returned with `broken: true`. Renderers MUST NOT emit an
 * `<a>` for broken links (WAI-ARIA guidance: disabled links are not
 * focusable). Instead, render a non-interactive span with an accessible
 * label so assistive tech announces the broken state.
 *
 * ## Backward compatibility
 *
 * Text that contains no `[[...]]` returns a single `{ type: 'text' }`
 * segment. Callers that don't care about wiki-links can keep rendering
 * the raw string — the parser never raises and never reorders content.
 *
 * @typedef {Object} WikiLinkTextSegment
 * @property {'text'} type
 * @property {string} value
 *
 * @typedef {Object} WikiLinkLinkSegment
 * @property {'link'} type
 * @property {string} value     Visible text.
 * @property {string} slug      Resolved target slug (always kebab-case).
 * @property {boolean} broken   True iff the target is not in the known set.
 * @property {string} raw       Original text inside the brackets (for debugging / graph).
 *
 * @typedef {WikiLinkTextSegment | WikiLinkLinkSegment} WikiLinkSegment
 */

/**
 * Turn any human-readable title into a kebab-case slug. Matches the
 * convention used by `article.id` on the seed dataset. Deterministic,
 * idempotent, and Unicode-aware (via NFKD fold) so `Coördination` ≡
 * `coordination`.
 *
 * @param {string} input
 * @returns {string}
 */
export function slugify(input) {
  if (typeof input !== 'string') return '';
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Turn a slug back into a display-cased label. `energy-abundance` →
 * `Energy Abundance`. Used when authors wrote `[[slug]]` with no alias.
 *
 * @param {string} slug
 * @returns {string}
 */
export function titleCaseFromSlug(slug) {
  if (typeof slug !== 'string' || slug.length === 0) return '';
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Match every `[[...]]` wiki-link in the input. Non-global RegExp would
 * re-match position 0 repeatedly; this one is constructed per call so it
 * has no shared lastIndex state across callers.
 *
 * The inner pattern `[^\[\]\n]+` forbids newlines and nested brackets so
 * a stray `[[` in prose won't eat the rest of the article.
 */
function makeWikiLinkRegExp() {
  return /\[\[([^\[\]\n]+?)\]\]/g;
}

/**
 * Parse a string into text + link segments. Unknown targets are flagged
 * `broken: true`.
 *
 * @param {string} text
 * @param {Set<string> | string[] | null | undefined} knownSlugs
 * @returns {WikiLinkSegment[]}
 */
export function parseWikiLinks(text, knownSlugs) {
  if (typeof text !== 'string' || text.length === 0) {
    return [];
  }
  const slugSet =
    knownSlugs instanceof Set
      ? knownSlugs
      : new Set(Array.isArray(knownSlugs) ? knownSlugs : []);

  /** @type {WikiLinkSegment[]} */
  const segments = [];
  const re = makeWikiLinkRegExp();
  let lastIndex = 0;
  let match;

  while ((match = re.exec(text)) !== null) {
    const [whole, inner] = match;
    const start = match.index;

    if (start > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, start) });
    }

    // MediaWiki `[[target|display]]`: LEFT is target, RIGHT is visible.
    const pipeIdx = inner.indexOf('|');
    /** @type {string} */
    let rawTarget;
    /** @type {string} */
    let display;
    if (pipeIdx === -1) {
      rawTarget = inner.trim();
      display = rawTarget;
    } else {
      rawTarget = inner.slice(0, pipeIdx).trim();
      display = inner.slice(pipeIdx + 1).trim();
    }

    const slug = slugify(rawTarget);
    const broken = slug.length === 0 || !slugSet.has(slug);

    // If the author wrote `[[slug]]` (no alias), prettify the slug for
    // the visible text. If they wrote `[[Some Title]]`, keep it as-is.
    let visible;
    if (pipeIdx !== -1) {
      visible = display;
    } else if (/^[a-z0-9-]+$/.test(rawTarget) && rawTarget.includes('-')) {
      visible = titleCaseFromSlug(rawTarget);
    } else {
      visible = rawTarget;
    }

    segments.push({
      type: 'link',
      value: visible,
      slug,
      broken,
      raw: inner,
    });

    lastIndex = start + whole.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}

/**
 * Walk every text-bearing field of an article and return the flat list
 * of parsed wiki-link targets found inside it. Used by
 * {@link buildWikiGraph}. Keeps empty strings / broken links in the
 * return value so graph consumers can report on them.
 *
 * @param {object} article
 * @param {Set<string>} knownSlugs
 * @returns {WikiLinkLinkSegment[]}
 */
export function collectLinksFromArticle(article, knownSlugs) {
  /** @type {WikiLinkLinkSegment[]} */
  const out = [];
  if (!article || typeof article !== 'object') return out;
  const content = article.content ?? {};
  /** @type {string[]} */
  const fields = [];
  if (typeof content.body === 'string') fields.push(content.body);
  if (Array.isArray(content.paragraphs)) {
    for (const p of content.paragraphs) {
      if (p && typeof p.description === 'string') fields.push(p.description);
    }
  }
  for (const field of fields) {
    for (const seg of parseWikiLinks(field, knownSlugs)) {
      if (seg.type === 'link') out.push(seg);
    }
  }
  return out;
}

/**
 * @typedef {Object} WikiGraph
 * @property {Record<string, string[]>} forward   slug → outgoing link slugs
 * @property {Record<string, string[]>} backlinks slug → incoming link slugs
 * @property {Array<{ from: string, raw: string }>} broken
 *   Every broken wiki-link in the corpus, tagged with its source article.
 */

/**
 * Build a forward + backlink graph for a set of articles. Stable order:
 * forward entries appear in source order; backlinks are sorted by slug
 * for deterministic rendering. Safe to call at module load — purely
 * functional, no I/O.
 *
 * @param {object[]} articles
 * @returns {WikiGraph}
 */
export function buildWikiGraph(articles) {
  const known = new Set();
  if (Array.isArray(articles)) {
    for (const a of articles) {
      if (a && typeof a.id === 'string') known.add(a.id);
    }
  }

  /** @type {Record<string, string[]>} */
  const forward = {};
  /** @type {Record<string, Set<string>>} */
  const backlinksBuilder = {};
  /** @type {Array<{ from: string, raw: string }>} */
  const broken = [];

  if (!Array.isArray(articles)) {
    return { forward, backlinks: {}, broken };
  }

  for (const article of articles) {
    if (!article || typeof article.id !== 'string') continue;
    const fromSlug = article.id;
    const seenFromThis = new Set();
    /** @type {string[]} */
    const out = [];

    for (const link of collectLinksFromArticle(article, known)) {
      if (link.broken) {
        broken.push({ from: fromSlug, raw: link.raw });
        continue;
      }
      if (link.slug === fromSlug) continue; // self-links are noise
      if (seenFromThis.has(link.slug)) continue;
      seenFromThis.add(link.slug);
      out.push(link.slug);

      if (!backlinksBuilder[link.slug]) backlinksBuilder[link.slug] = new Set();
      backlinksBuilder[link.slug].add(fromSlug);
    }

    forward[fromSlug] = out;
  }

  /** @type {Record<string, string[]>} */
  const backlinks = {};
  for (const slug of Object.keys(backlinksBuilder)) {
    backlinks[slug] = Array.from(backlinksBuilder[slug]).sort();
  }

  return { forward, backlinks, broken };
}
