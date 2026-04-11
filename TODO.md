# Wiki App — Prioritized Backlog

_Living journal for the `@dds/ageofabundance-wiki` app built on `@dds/renderer`._
_Last updated: 2026-04-11_

## Working rules

- One focused feature, page, or content primitive per session.
- Every wiki feature is a **plugin** layered on top of `@dds/renderer`; no core forks.
- `UniversalSection` is the one true content shape — articles, sidebars, TOC, infoboxes all compile to it.
- Backward compatible, additive, accessibility-first, theme-token-driven.

## Now (next up)

- [ ] **Wiki home / `/wiki` index page** — featured article, recent, categories (needs article model to exist first)
- [ ] **Wiki-link parser** — `[[Slug]]` → internal `<Link>` with broken-link styling
- [ ] **Article categories & tag index** — `/wiki/category/[slug]`
- [ ] **Backlinks panel** — reverse index built at build time, rendered per article
- [ ] **Article search** — static Pagefind or Orama index (static-build friendly)

## Next

- [ ] **Revision history primitive** — `meta.revisions[]` on each article, sidebar viewer
- [ ] **Infobox renderer enhancements** — typed fields, image, structured facts
- [ ] **Cross-link graph view** (lazy, Three.js, disposes on unmount)
- [ ] **MDX ingestion pipeline** — parse `content/**/*.mdx` → `UniversalSection[]` at build
- [ ] **Citations & footnotes primitive** — numbered refs, back-links to cited paragraph
- [ ] **Long-form a11y polish** — ARIA landmarks audit, skip-to-TOC, skip-to-content
- [ ] **Theme variant QA on article body** — minimal, midnight, vibrant
- [ ] **Print stylesheet for article pages**

## Later

- [ ] **Draft/published states** via `display.visible` + feature flag
- [ ] **Edit-on-GitHub** footer link per article
- [ ] **Article related-links** recommender
- [ ] **i18n** per-article locale variants

## Done

<!-- Append one-liners as items ship. Format: "- [x] <date> <sha-short> — description" -->
- [x] 2026-04-11 — Wiki article page primitive: `/wiki/[slug]` dynamic route with
  `generateStaticParams` + `generateMetadata`, sample UniversalSection content
  for two seed articles, a `wiki-infobox` plug-in and a `wiki-body` plug-in
  layered onto the default `@dds/renderer` registry, semantic a11y-first shell
  (`<main>` / `<nav aria-label="Table of contents">` / `<aside>` / `<article>`),
  skip-link, breadcrumbs, custom-property theme tokens, 72ch measure, 44px touch
  targets, `prefers-reduced-motion` guard, a `not-found` state, and a 5-scenario
  Playwright spec wired via a new `wiki` project + second webServer in
  `playwright.config.ts`. Also adds the missing `next.config.mjs` +
  `postcss.config.cjs` to the wiki app so it builds against the monorepo's
  tailwind v4 + `@dds/renderer` transpile list.

## Schema extensions proposed

<!-- Record any `UniversalSection` additions considered. Nothing yet; all additions so far
     live inside optional buckets (`meta.wiki`, `content.paragraphs`, etc.) and stay
     backward compatible. -->

## Reverted / Lessons

<!-- Any session rollbacks and the root-cause hypothesis. None yet. -->
