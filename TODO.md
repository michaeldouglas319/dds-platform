# Wiki Backlog — theageofabundance.wiki

Ordered by value. One item per session; each ship is a plugin to `@dds/renderer`
or a thin consumer of the existing `UniversalSection` schema — never a fork of
the core.

## Done

- [x] **First article page + `ArticleRenderer` plugin** _(2026-04-11)_
      Long-form editorial layout registered under `display.layout: "article"`,
      backed by semantic `<article>`/`<header>`/`<main>`/`<footer>` landmarks,
      skip link, AAA body contrast, reduced-motion guards, 68ch measure, and a
      CSS-variable theming contract. First seed article at `/article/welcome`
      is statically generated. Golden path covered by `e2e/wiki.spec.ts`.
      Deployed commit: _recorded by the session summary below_.

## Next up — content & reading experience

- [ ] **Wiki-link parser** — parse `[[slug]]` and `[[slug|label]]` inside
      `paragraph.description` at build time, resolve against the article
      registry, and render `<a>` for hits / dashed red `<span>` for broken
      links. Fully additive to `ArticleRenderer`. Mirror Obsidian / DokuWiki
      semantics.

- [ ] **Backlinks section** — build an inverted index from the article
      registry at build time and surface an "Articles that link here" aside
      at the bottom of every article. Uses the same `UniversalSection` shape.

- [ ] **Table of contents aside** — derive headings from `content.paragraphs`
      (h2 level) and render a sticky aside on desktop. Must respect
      `prefers-reduced-motion` (no smooth-scroll).

- [ ] **Infobox primitive** — `display.layout: "infobox"` renderer for
      sidebars (subject metadata, small image, key/value facts). Must compose
      with `ArticleRenderer` on the same page.

- [ ] **Category index** — `/category/[slug]` route that lists articles by
      `subject.category`. Static-generated.

## Search & navigation

- [ ] **Full-text search** — evaluate Pagefind vs. Orama vs. FlexSearch for a
      static-site build. Pagefind is the default unless we hit a blocker
      (binary build, CSP, etc.). Must degrade gracefully without JS.

- [ ] **Header nav + breadcrumbs** — shared chrome across wiki pages with
      skip-link, nav landmarks, and a visible current-section indicator.

- [ ] **Article search suggest (type-ahead)** — built on top of whichever
      full-text index we pick. Keyboard-navigable combobox (APG pattern).

## Revisions & authorship

- [ ] **Revision history view** — render the git log of an article file as a
      UniversalSection timeline, rendered via the existing `TimelineRenderer`.

- [ ] **Last-edited attribution** — pull `meta.author` and `meta.lastUpdated`
      from git instead of the data file, so metadata can't drift.

## Quality bar

- [ ] **Axe-core E2E sweep** — run `@axe-core/playwright` on every wiki route,
      fail the build on any serious/critical violation.

- [ ] **Visual regression on article page** — Playwright screenshot in
      minimal + midnight + vibrant theme variants.

- [ ] **Pagefind / Orama size budget** — cap the index at ≤ 200 KB gzipped.

## Schema extensions (proposed, not yet implemented)

- `UniversalSection.content.paragraphs[].wikilinks?: string[]` — an optional
  denormalized cache of parsed wiki-link targets, populated at build time by
  the wiki-link parser. Additive; renderers ignore it by default.

- `UniversalSection.meta.backlinks?: Array<{ slug: string; title: string }>` —
  populated at build time by the backlinks index, consumed by the backlinks
  aside. Additive.

- `UniversalSection.meta.editor?: { name?: string; avatar?: string }` — pulled
  from `git log` by a build step. Additive.

No schema changes merged yet — all of the above stay proposals until the
session that actually ships them.

## Notes

- Every wiki feature ships as a plugin renderer or a build-time transformation
  — the core `@dds/renderer` package stays wiki-agnostic.
- Backward compatibility is non-negotiable: no existing `UniversalSection`
  should need to change to keep rendering.
- All long-form pages target AAA body-copy contrast and a ≤ 72ch measure.
