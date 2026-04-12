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
- [x] **Table of contents** — auto-generated from `<h2>`/`<h3>` inside
  article body, sticky sidebar on wide screens, collapsible on mobile.
  Anchor scroll must respect `prefers-reduced-motion`.
  _Shipped: see session log below._
- [x] **Backlinks panel** — at article footer, list every article that
  links to the current page. Built by inverting the wiki-link graph at
  build time.
  _Shipped: see session log below._
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

- [x] **Categories** — tag pages at `/t/[tag]` listing all articles with
  that tag; tag chips in article header. Plus `/t` tags index with counts.
  _Shipped: see session log below._
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
  module provides a regex-based parser for `[[Page Name]]` and
  `[[slug|Display Text]]` syntax. Links are resolved against the article
  slug index at build time; resolved links render as `<a class="wiki-link"
  href="/a/{slug}">`, broken links render as `<span class="wiki-link--broken"
  aria-disabled="true">` with a `title` tooltip. A new `WikiText` RSC
  component (zero client JS) replaces raw `<p>` text rendering in
  `wiki-article.jsx`. The word counter in `wiki-meta.js` now strips
  wiki-link syntax via `stripWikiLinks()` before counting, so bracket
  notation never inflates reading time or word count. Seed articles now
  cross-link: age-of-abundance ↔ energy-abundance ↔ coordination-abundance,
  plus one intentional broken link (`[[Governance Protocols]]`) exercising
  the broken-link visual state. Includes `buildOutboundLinks()` and
  `buildBacklinks()` graph helpers for the future backlinks panel. 25 new
  vitest unit tests; 5 new Playwright E2E tests covering resolved links,
  aliased links, broken-link state, navigation, and metadata integrity.
  CSS uses only custom properties; broken links use dashed underline +
  `cursor: help` for non-color-only differentiation (WCAG). Backward
  compatibility: `@dds/types` untouched; existing routes unchanged;
  article pages still 150 B first-load JS (no client cost).
  Shipped as commit `e3510e07dcbbf4d59b9277ada5c86030c0e40657`.
- 2026-04-12 — **Table of contents** shipped. New `content/wiki-toc.js`
  module provides `slugifyHeading()` and `buildTocEntries()` utilities
  for deterministic anchor ID generation with duplicate-heading dedup.
  New `components/wiki-toc.jsx` RSC renders a `<nav aria-label="Table
  of contents">` with native `<details>/<summary>` disclosure — zero
  client JS. On mobile, the TOC starts expanded and is user-collapsible;
  on wide screens (≥72rem), CSS Grid places it as a sticky sidebar
  alongside the article body. Modified `wiki-article.jsx` stamps matching
  `id` attributes on `<h2>` headings, wraps body+TOC in a
  `.wiki-article__content` grid container, and applies a
  `.wiki-article--has-toc` modifier that widens the article to
  `calc(72ch + 16rem)` on desktop. CSS additions: `scroll-behavior:
  smooth` on `<html>` (guarded by the existing `prefers-reduced-motion`
  rule), `scroll-margin-top: 1.5rem` on anchored headings, numbered
  TOC links with CSS counters, 44px touch targets. Respects
  `meta.wiki.toc === 'off'` to suppress per article. 10 new vitest
  unit tests for slug/buildTocEntries edge cases; 5 new Playwright E2E
  tests covering: nav landmark + entry count, anchor-to-heading matching,
  click navigation, details disclosure state, scroll-margin offset.
  All 19 wiki E2E + 131 unit tests pass, no regressions. Backward
  compatibility: `@dds/types` untouched; existing routes unchanged;
  article pages still zero client JS.
  Shipped as commit `a8024c0a87be10ef6f7c8ca5fe3a550ccf702161`.
- 2026-04-12 — **Backlinks panel** shipped. New `getBacklinksForSlug(slug)`
  helper in `content/wiki-links.js` builds the outbound→backlink graph,
  then enriches each source article with its title and summary (from
  `meta.wiki.summary` → `subject.summary` → `subject.subtitle` fallback
  chain). New `components/wiki-backlinks.jsx` RSC renders a
  `<section aria-labelledby="backlinks-heading">` with a `<ul>` list of
  linked article cards showing title + summary excerpt (2-line clamp).
  Placed inside the article footer, before the "Back to wiki" link.
  Each card is a `min-height: 44px` link to `/a/{slug}`, styled with
  CSS custom properties (surface-raised background, rule border, accent
  hover). The panel renders nothing when no backlinks exist (zero DOM
  footprint). `wiki-article.jsx` now imports `getBacklinksForSlug` and
  passes the result to `WikiBacklinks`. 5 new vitest unit tests cover:
  enriched backlinks for age-of-abundance (2+ sources), title/summary
  shape, empty array for unknown slugs, no self-links, correct title
  from subject. 5 new Playwright E2E tests cover: section visibility +
  heading text, title + summary rendering, click navigation to source
  article, accessible landmark structure (aria-labelledby, ul list),
  44px touch-target minimum. All 25 wiki E2E + 141 unit tests pass,
  no regressions. Backward compatibility: `@dds/types` untouched;
  existing routes unchanged; article pages still zero client JS.
  Shipped as commit `24332fa7a8189f465709705166b78cad074ca267`.
- 2026-04-12 — **Categories** shipped. New `/t` tags index page lists all
  topic tags with article counts via `listTagsWithCounts()` helper; each tag
  card links to `/t/[tag]`. New `/t/[tag]` route shows articles filtered by
  tag via `listArticlesForTag()` helper, sorted newest-first. Both routes
  use `generateStaticParams()` + `dynamicParams: false` for static generation
  and proper 404 on unknown tags. Tag chips in article headers
  (`wiki-article.jsx`) are now `<a>` links to `/t/{tag}` instead of plain
  `<li>` elements. Breadcrumb trail: Home > All tags > {Tag}. CSS uses only
  custom properties; tag cards are 44px min-height touch targets with hover
  states via `--wiki-accent`. All pages zero client JS. 8 new Playwright E2E
  tests cover: tags index rendering + count + navigation, tag page filtered
  articles + back-link, article header tag chip links, 44px touch targets,
  unknown tag 404. 8 new vitest unit tests cover: listArticlesForTag
  filtering + sorting + empty, listTagsWithCounts shape + cross-check with
  listAllTags. All 31 wiki E2E + 152 unit tests pass, no regressions.
  Backward compatibility: `@dds/types` untouched; existing routes unchanged.
  Shipped as commit `d660ce1`.
