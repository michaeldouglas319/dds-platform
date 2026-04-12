# Wiki Backlog — @dds/ageofabundance-wiki

The wiki site is built as a consumer of `@dds/renderer` and the Universal
Section schema. Wiki-specific behavior is shipped as local components / data
inside `apps/ageofabundance-wiki/` that consume `UniversalSection`-shaped
data. The core renderer is never forked.

Each item below is scoped to be shippable in a single focused session.

## P0 — Content primitive foundation

- [x] **Wiki article primitive** — static seed dataset of UniversalSection
  articles, dynamic `/a/[slug]` route, featured-articles homepage,
  `not-found.jsx`, long-form typography tokens, Playwright golden-path test.
  _Shipped: see session log below._
- [x] **Article metadata schema** — formalize `meta.wiki` fields
  (`lastUpdatedISO`, `authors[]`, `readingTimeMinutes`, `wordCount`,
  `tags[]`, `summary`) so all downstream features share one source of truth.
  Additive — existing articles continue to parse.
  _Shipped: see session log below._
- [x] **Article index (`/a`)** — articles sorted by `lastUpdatedISO`
  (newest first), client-side tag filter with `aria-pressed` toggle
  buttons, article count with `aria-live` announcements, clear-filter
  control, statically generated. _Shipped: see session log below._
- [x] **Wiki-link parser** — `[[Page Name]]` and `[[slug|Display Text]]`
  rewriter that resolves to internal `/a/<slug>` links at build time,
  surfaces broken-link warnings, and supports a "broken link" visual state.
  _Shipped: see session log below._
- [ ] **Table of contents** — auto-generated from `<h2>`/`<h3>` inside
  article body, sticky sidebar on wide screens, collapsible on mobile.
  Anchor scroll must respect `prefers-reduced-motion`.
- [ ] **Backlinks panel** — at article footer, list every article that
  links to the current page. Built by inverting the wiki-link graph at
  build time.
- [ ] **Wire wiki app into `@dds/hub` domain router** — the hub
  (`apps/hub/config/domains.ts`) currently serves `ageofabundance.wiki`
  via `renderer: 'landing'`, so the article primitive shipped this
  session is not yet reachable at the public domain. Either (a) add a
  `wiki` renderer in `apps/hub/renderers/` that reads from
  `apps/ageofabundance-wiki/content/articles.js` (after lifting it to
  a shared package), or (b) re-point the `ageofabundance-wiki` Vercel
  project back to `dds-platform/main`. Must not break existing
  domains' routing.

## P0 — Navigation & discovery

- [ ] **Categories** — tag pages at `/t/[tag]` listing all articles with
  that tag; tag chips in article header.
- [ ] **Full-text search** — evaluate Pagefind vs Orama vs FlexSearch.
  Target: static-indexed, <150kb bundle, keyboard-driven combobox,
  AA-compliant results listbox.
- [ ] **Recent changes feed** — `/recent` page sorted by `lastUpdatedISO`,
  JSON feed at `/recent.json`.
- [ ] **Random article** — `/random` route that 307-redirects to a
  randomly chosen article slug.

## P1 — Content authoring

- [ ] **MDX pipeline** — `content/articles/*.mdx` authored files with
  frontmatter → UniversalSection at build time. Must not break the JS
  fallback seed dataset.
- [ ] **Code block renderer** — Shiki-highlighted code blocks with copy
  button, `prefers-reduced-motion` safe.
- [ ] **Image figures** — `<figure>` with caption + proper `alt`, lazy
  loaded, responsive via `next/image`.
- [ ] **Infobox primitive** — sidebar card for facts/key-value data,
  renders from `meta.infobox` entries.

## P1 — Revisions & governance

- [ ] **Revision history** — git-derived commit log per article at
  `/a/[slug]/history`.
- [ ] **Edit page stub** — "Edit on GitHub" link on every article.
- [ ] **Contributors strip** — avatars + usernames derived from commit
  history.

## P2 — Polish & performance

- [ ] **Theme variants wired up** — honor `data-theme-variant` on `<html>`
  across the 9 DDS variants. Verify `minimal`, `midnight`, and one vibrant.
- [ ] **Reading progress indicator** — slim top bar driven by scroll.
  `prefers-reduced-motion` must disable animation.
- [ ] **Print stylesheet** — collapse nav/TOC, set linear flow, black-on-
  white, show wiki-link hrefs.
- [ ] **OG image generation** — per-article dynamic OG cards via
  `@vercel/og`.

## Schema extensions (proposed, deferred)

- `meta.wiki` — `{ lastUpdatedISO, authors[], readingTimeMinutes,
  wordCount, tags[], summary, infobox?, toc?: 'auto' | 'off' }`. All fields
  optional; any existing section without `meta.wiki` must still parse.
- `content.wikiLinks` — optional parsed wiki-link graph populated at
  build time for the backlinks feature.

---

## Session log

- 2026-04-11 — **Wiki article primitive** shipped. Seed dataset of 3
  UniversalSection-shaped articles, static-generated `/a/[slug]` route,
  `/a` index, featured articles on home, `not-found.jsx`, long-form
  typography tokens (`--wiki-measure`, `--wiki-leading-body`). Playwright
  test covers home → article golden path, 404, and skip-link focus.
  Shipped as commit `4b6c29b8cfc386e034f2f8064b992626fd668132`.
- 2026-04-11 — **Article metadata schema** shipped. New
  `content/wiki-meta.js` module is the single source of truth for every
  field under `meta.wiki`: `lastUpdatedISO`, `authors[]`, `tags[]`,
  `summary`, `wordCount`, `readingTimeMinutes`, `toc`, `infobox`. Explicit
  author-provided values always win; the helper fills gaps by counting
  words in body + paragraphs and dividing by the Brysbaert (2019)
  meta-analysis average of 238 wpm. Every consumer (article page, article
  card, `generateMetadata`) now reads through `deriveWikiMeta(article)`;
  the frozen return object prevents accidental downstream mutation. The
  article page also emits Schema.org `Article` JSON-LD derived from the
  same view so search engines see the canonical metadata. 34 new vitest
  cases cover every derivation edge; Playwright now asserts the derived
  reading time, word count, author list, tag chips, and JSON-LD payload
  render on `/a/age-of-abundance`. Backward compatibility: `@dds/types`
  untouched (meta remains `Record<string, unknown>`); existing articles
  with or without `meta.wiki` continue to parse. Vitest `include` was
  extended to pick up tests under `apps/**`. Shipped as commit
  `c5b72a9cddbaf6bf3e6009f47d1030e3ccea9109`.
- 2026-04-12 — **Article index (`/a`)** shipped. Rewrote the flat article
  list at `/a` into a sortable, filterable index page. Articles are sorted
  by `lastUpdatedISO` descending (newest first) via `deriveWikiMeta`;
  `listArticlesSortedByDate()` and `listAllTags()` helpers added to
  `content/articles.js`. A new `TagFilter` client component provides
  interactive tag-chip filtering: each tag button toggles `aria-pressed`,
  an `aria-live` paragraph announces the filtered count to screen readers,
  and a "Clear filter" control resets the view. All tag buttons meet the
  44px touch-target minimum. The page remains statically generated (0 JS on
  article and home pages; 1.88 kB client bundle on `/a` only). CSS uses
  only custom properties; transitions are guarded by
  `prefers-reduced-motion`. 4 new Playwright tests cover: article count
  display, tag toggle + active state, filtering by a specific tag, and
  deselect/reset. Backward compatibility: no changes to `@dds/types`,
  `@dds/renderer`, or the existing article page / home page.
  Shipped as commit `c5b72a9cddbaf6bf3e6009f47d1030e3ccea9109`.
- 2026-04-12 — **Wiki-link parser** shipped. New `content/wiki-links.js`
  module provides `[[Page Name]]` and `[[slug|Display Text]]` syntax
  parsing following MediaWiki/Obsidian conventions. The parser normalizes
  targets to URL-safe slugs (lowercase, spaces→hyphens, strip special
  chars) and resolves them against the known article set at build time.
  `segmentWikiContent()` splits text into alternating plain-text and
  resolved-link segments; the new `WikiContent` RSC component renders
  valid links as `<a class="wiki-link">` and broken links as
  `<span class="wiki-link wiki-link--broken" aria-disabled="true">` with
  a `title` tooltip. The broken-link visual uses dashed underlines (not
  color alone) for WCAG compliance. `buildWikiLinkGraph()` computes the
  full outgoing-link graph for all articles — ready for the backlinks
  panel to invert in a future session. Seed articles now cross-reference
  each other (Age of Abundance ↔ Energy Abundance ↔ Coordination
  Abundance) plus one intentional broken link (`[[Artificial General
  Intelligence|ML systems]]`) to exercise the broken state. 20 new vitest
  cases cover slug normalization, parsing, resolution, segmentation, and
  graph building; 5 new Playwright tests cover valid-link rendering,
  navigation, broken-link a11y state, `data-wiki-target` attributes, and
  metadata preservation. All existing tests continue to pass. Backward
  compatibility: no changes to `@dds/types`, `@dds/renderer`, or existing
  routes. The parser is additive — articles without `[[…]]` syntax
  render exactly as before.
