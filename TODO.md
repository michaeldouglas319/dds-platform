# dds-platform — Wiki app TODO

Prioritized backlog for the wiki experience built on top of `@dds/renderer`.
One focused session = one shipped item. Keep changes additive, backward
compatible, and design-system-honest. The Universal section schema must parse
without changes — wiki features ship as plugins / app-level code, never as
forks of the core renderer.

## Priority 0 — Foundation (no wiki without these)

- [x] **article-route**: ship `/wiki/[slug]` as a first-class wiki article
  primitive: typed article registry → `SectionBatchRenderer` → semantic
  `<article>` shell with auto-generated TOC, prose styles, 404. _(2026-04-11)_
- [ ] **wiki-link-parser**: resolve `[[Article Title]]` style cross-links
  inside `content.body` to `/wiki/<slug>`. Render unknown targets as a
  visually-distinct broken link.
- [ ] **search-index**: build a static search index (Pagefind or
  FlexSearch) at build time and ship a keyboard-first command palette.
- [ ] **category-index**: `/wiki/category/[slug]` listing with the existing
  `subject.category` field (no schema change required).
- [ ] **backlinks**: compute reverse cross-link graph at build time, render a
  "What links here" footer on each article.

## Priority 1 — Quality & polish

- [ ] **revisions-view**: surface `metadata.history[]` (deferred schema
  extension) as a per-article timeline; reuse `timeline` renderer.
- [ ] **infobox-renderer**: side-rail infobox that consumes
  `subject` + `media` for biographical / topical articles.
- [ ] **anchor-headings**: clickable `#` anchors on every section heading
  (without nesting `<a>` inside `<h*>` — Wikipedia a11y rule).
- [ ] **mobile-toc**: collapsible TOC drawer for mobile; sticky on desktop.
- [ ] **prefers-reduced-motion** on TOC scroll-to-anchor smooth scroll.

## Priority 2 — Content primitives

- [ ] **figure-renderer**: `<figure>` + `<figcaption>` with credit + license
  fields (additive `media.figure.credit`, `media.figure.license`).
- [ ] **callout-renderer**: note/warning/tip box with icon + accessible role.
- [ ] **footnote-renderer**: numbered footnote pop-overs that degrade to
  bottom-of-article list.
- [ ] **code-block-renderer**: syntax-highlighted prose code with copy button.

## Schema extensions (proposed, deferred)

- `metadata.history?: Array<{ ts: string; author: string; summary: string }>` —
  per-article revision log.
- `media.figure?: { src: string; alt: string; caption?: string; credit?: string; license?: string }`
  — atomic figure primitive.
- `meta.crossLinks?: string[]` — explicit out-link list (so backlink graph
  doesn't need to re-parse body).

## Completed

<!-- session log: newest on top -->

- **2026-04-11 — `/wiki/[slug]` article primitive bootstrapped on
  `ageofabundance-wiki`.** First-class wiki article route built entirely on
  the existing `UniversalSection` schema and `SectionBatchRenderer` — no
  changes to `@dds/types` or `@dds/renderer`. Article content lives in typed
  ES modules in `apps/ageofabundance-wiki/content/articles/`, registered
  through `lib/articles.js`. The page renders a semantic `<article>` shell
  with a sticky scroll-spy table of contents (`IntersectionObserver` +
  `aria-current="location"`, no scroll listeners), AAA-contrast prose tokens
  driven by CSS custom properties (`--wiki-*`), `:focus-visible` rings, a
  skip link, `prefers-reduced-motion` guards, and ≥44px touch targets. Two
  seed articles (`welcome`, `universal-section-schema`) statically pre-render
  via `generateStaticParams`; unknown slugs hit a route-segment
  `not-found.jsx` that lists known articles for recovery. Replaced the dead
  `e2e/basic.spec.ts` (which targeted a `blackdot-dev` build that doesn't
  even compile on baseline) with `e2e/wiki.spec.ts`, six tests covering
  index → article navigation, TOC anchors, `aria-current` on click, the
  custom 404, single-h1 + skip link a11y, and mobile responsiveness.
  Playwright now boots the wiki dev server directly. All 6 e2e + 51 unit
  tests green.
