# dds-platform — Wiki App TODO

Prioritized backlog for the wiki experience built on top of `@dds/renderer`.
One focused feature per session. Additive, backward-compatible, plugin-first.
Every page must be expressible as a `UniversalSection`.

## Priority 0 — Content primitives (unblock long-form reading)

- [ ] **wiki-toc-renderer**: accessible, sticky "On this page" table of contents
  driven by the section schema. `<nav aria-label>` + `<ol>` + `aria-current`.
  IntersectionObserver-powered active highlight, `prefers-reduced-motion` smooth
  scroll guard. Tokenized via CSS custom properties.
- [ ] **breadcrumb-renderer**: category → sub-category → article trail with
  `aria-label="Breadcrumb"` and schema.org BreadcrumbList JSON-LD.
- [ ] **article-body-renderer**: measure ≤ 75ch, heading-anchored section IDs,
  footnote popovers, citation links. Drop-in for `content.paragraphs`.
- [ ] **wiki-link (inline)**: `[[Article Title]]` → resolved link with broken-
  link fallback (red link pattern from Wikipedia / MediaWiki).

## Priority 1 — Navigation & discovery

- [ ] **wiki-sidebar-renderer**: hierarchical category nav (collapsible), keyboard
  navigable, `aria-expanded` on disclosures.
- [ ] **backlink-panel-renderer**: "What links here" panel derived from a
  backlink graph (parametric data).
- [ ] **search-input (command palette)**: cmd+k entry point with live suggestions.
  Target Pagefind or Orama for static-site search (research pending).
- [ ] **related-articles-grid**: tag/category similarity-based cards.

## Priority 2 — Content lifecycle

- [ ] **revision-history-renderer**: diff view against prior revision, author +
  timestamp, `time datetime` element for proper SR read-out.
- [ ] **stub-banner / needs-citation banner**: parametric editorial callouts.
- [ ] **contributors-avatar-row**: OG-image-style contributor attribution.

## Priority 3 — Performance & polish

- [ ] **static-generate all wiki routes** with ISR fallback for long tail.
- [ ] **lazy-load heavy embeds** (tables > 500 rows, interactive diagrams).
- [ ] **reading-progress indicator** on article pages (scroll-driven, reduced-
  motion guard).
- [ ] **skip-to-content link** as first interactive element on every wiki page.

## Schema extensions (proposed, deferred)

- `meta.tocItems?: { text: string; href: string; level?: number }[]` — explicit
  override of the auto-derived TOC list (already honored by wiki-toc-renderer
  when present, no schema changes required because `meta` is already an
  open record).
- `meta.reduceMotion?: 'auto' | 'always' | 'never'` — mirrors dds-renderer
  proposal; opt-in only. (Not yet added.)

## Completed

<!-- session log: newest on top -->

- **2026-04-11 — wiki-toc-renderer (Priority 0).** Added first wiki primitive
  to `@dds/renderer`: accessible, schema-native "On this page" table of
  contents. Derives items from `meta.tocItems` > `children` (id + subject.title)
  > `content.items` (slug-generated hrefs). Registered under layout keys
  `wiki-toc` and `toc`. `<nav aria-label>` + `<ol role="list">` + `aria-current="location"`
  with `IntersectionObserver`-driven active-heading tracking. Smooth scroll
  honors `prefers-reduced-motion`. Fully tokenized via CSS custom properties
  (`--wiki-toc-*`) with light/dark + theme-variant fallbacks; no hardcoded
  colors. Sticky on desktop (top: var(--wiki-toc-offset)), static on mobile.
  Touch targets ≥ 44px. Empty-state + no-IO-support guards. Additive only —
  no schema changes, no breaking changes to `@dds/types` or existing registry
  keys. Unit test covers golden path + empty state + custom meta.tocItems.
  Playwright spec added for future browser-enabled runs.
