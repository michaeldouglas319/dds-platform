# Wiki App — Session Backlog

Staff-engineer journal for incremental improvements to the `@dds/ageofabundance-wiki`
app (and its sibling `@dds/theageofabundance-wiki`). One cohesive feature per
session. The wiki is built on top of `@dds/renderer` via the Universal Section
schema — wiki-specific renderers plug in, they do not fork the core.

## Design north star

* **Parametric** — every page, infobox, sidebar, TOC and body flows from a
  `UniversalSection`-shaped record. No hard-coded editorial layouts.
* **Accessibility-first** — semantic HTML, landmarks, visible focus, SR labels,
  reduced-motion guards, WCAG AA minimum (AAA on long-form body).
* **Plugin-compatible** — add new renderers or parsers as app-local plugins
  that compose with `defaultRegistry` from `@dds/renderer`.
* **Static-first** — pre-render with `generateStaticParams`; lazy-load heavy
  embeds; no unnecessary `'use client'`.
* **Editorial quality** — long-form measure capped at 75ch, generous leading,
  high-contrast tokens via CSS custom properties, light/dark symmetry.

## Backlog (prioritized)

1. **[DONE — this session]** Parametric wiki article model + article detail
   route + article index + broken-link 404. Content is shape-compatible with
   `UniversalSection` and wiki-links (`[[Slug]]`, `[[Slug|Alias]]`) are parsed
   at render time with an explicit broken-link visual state.
2. Client-side article search (Pagefind or FlexSearch) with keyboard shortcut
   and SR live region for result count.
3. Backlink *panel* — compute reverse index at build time from the wiki-link
   parser and surface it in a sidebar `UniversalSection`.
4. Category/tag index pages generated from article metadata
   (`generateStaticParams`).
5. MDX pipeline for richer article body — remark plugin that emits the same
   paragraph-shaped content the renderer already consumes.
6. Revisions / "last updated" trail with a diff viewer for article history.
7. Table of contents (TOC) generated from heading structure, anchored
   navigation with visible focus.
8. Infobox renderer as a UniversalSection layout (`layout: 'wiki-infobox'`).
9. Theme variant picker wired to `data-theme-variant` on the wiki shell.
10. Cross-wiki link resolution between `ageofabundance.wiki` and
    `theageofabundance.wiki`.

## Schema notes

* `WikiArticle` is a stand-alone type defined inside the wiki app. Its
  `subject` and `content` fields mirror `UniversalSection.subject` / `.content`
  so records can be projected into the universal schema without a migration if
  we later switch to rendering via `SectionBatchRenderer`.
* No changes to `packages/types/section.ts` in this session.
* No changes to `packages/renderer` in this session.

## Session log

* **2026-04-11** — Shipped parametric wiki article rendering
  (index + `/wiki/[slug]` + not-found + wiki-link parser with broken-link
  state). Plugin-compatible, static-generated, AA-contrast, reduced-motion
  guarded. Playwright golden-path spec added at `e2e-wiki/wiki.spec.ts` and
  wired through a dedicated `playwright.wiki.config.ts` so it runs isolated
  from the existing `blackdot-dev` suite. Commit: _(pending push)_.
