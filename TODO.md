# Wiki Backlog (ageofabundance.wiki)

Prioritized backlog for the wiki app built on top of @dds/renderer. Each item
should ship as an additive plugin renderer and/or page wired through the
UniversalSection schema — never a core fork. Backward compatibility is
non-negotiable: the existing @dds/types exports, defaultRegistry consumers,
and blackdot-partners deploy must keep working after every change.

## Legend

- `[ ]` todo
- `[~]` in progress
- `[x]` done — one-line summary + deployed commit SHA
- `[!]` reverted — root-cause hypothesis + follow-up item

## P0 — Content primitives (the long-form editorial backbone)

- [x] Wiki article renderer plugin (`wiki-article` / `article`) — semantic
  `<article>` landmark, h1 lede, h2 body sections with permalink anchor IDs,
  ≤75ch measure, prefers-reduced-motion guard, high-contrast tokens.
  Ships: packages/renderer/renderers/wiki-article-renderer.tsx + unit test +
  Playwright golden path against ageofabundance-wiki home. — commit: pending
- [ ] Article infobox renderer plugin (`wiki-infobox`) — keyed fact sheet on
  the side of an article, derived from `subject.tags` and `content.items`.
- [ ] Auto Table of Contents (TOC) plugin (`wiki-toc`) — reads heading anchors
  from sibling `wiki-article` section in the same page, sticky, scroll-spy.

## P1 — Navigation & linking

- [ ] Wiki-link parser utility — `[[Page Title]]` / `[[slug|label]]` markdown
  transform that resolves against the article registry. Must gracefully
  render a "broken link" state for unknown slugs.
- [ ] Category/tag index page — lists articles sharing a tag from the config.
- [ ] Cross-link backlink panel — shows "pages that link here" for a slug.

## P2 — Search & discovery

- [ ] Client-side full-text search via Pagefind or Orama over statically
  generated wiki articles. Keyboard-accessible combobox.
- [ ] Page-not-found (404) state for wiki slugs with suggestions.

## P3 — Revisions & editorial

- [ ] Revision history UI — display commit history for an article slug, diff
  view between any two revisions.
- [ ] "Last updated" metadata surfaced in the article header.

## Schema extensions (proposed, deferred)

- None yet. Every item above parses into the existing UniversalSection shape:
  `subject.title`, `subject.subtitle`, `subject.summary`, `content.body`,
  `content.paragraphs[]` (with optional `subtitle` = h2 anchor label and
  `description` = body copy), `content.items[]`, and `subject.tags`.

## Session journal

### 2026-04-11 — Wiki article renderer plugin (P0)
- What shipped: `wiki-article` renderer plugin that maps a UniversalSection
  into a semantic long-form editorial article with slugged h2 anchors, an
  optional lede, citations footnotes, ≤75ch measure, and a
  prefers-reduced-motion guard. Wired into apps/ageofabundance-wiki home page
  as the first real content surface. Playwright config switched to the wiki
  app so the golden path runs against the actual wiki.
- Pattern adopted: pure plugin — new renderer exported from @dds/renderer and
  added to defaultRegistry under `wiki-article` and `article` keys, no
  breaking changes to @dds/types or existing renderers. Wiki app supplies a
  `UniversalSection` fixture and uses `SectionBatchRenderer` to render it so
  any future wiki page is just config.
- Deployed commit: pending (see commit SHAs in session summary).
