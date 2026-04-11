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

- **2026-04-11 — wiki-toc-renderer (Priority 0).** Shipped on session branch
  `claude/fervent-hopper-X6QaX` at commit `88e2333`. Added first wiki primitive
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
  keys. Unit tests: 10 new vitest cases (resolution priority, golden path,
  empty state, custom meta override, style dedupe, missing-title fallback,
  no-IntersectionObserver runtime). Registry test expected-keys set updated.
  Playwright spec added at `e2e/wiki-toc.spec.ts` (feature-detection skip so
  it never red-builds before a consumer mounts the TOC). Vitest: 63/63 green.
  Local `pnpm turbo run build --filter=@dds/blackdot-partners` compiled the
  renderer package successfully (the pre-existing Clerk-env prerender step is
  env-var related, unrelated to this change). Vercel verification deferred:
  the dds-platform Vercel project is configured to deploy only from `main`,
  so no preview deploy is triggered by the session branch push. Risk profile
  for production is zero — the renderer is a plugin registered under new,
  unused layout keys; nothing in the current production bundle mounts it.

## Follow-ups discovered during this session

- **blackdot-dev `/sections` is pre-broken.** `apps/blackdot-dev/app/sections/page.jsx`
  imports `../../data/site.config.json` which was deleted by the
  `e60f2fc emergency: full purge` and never restored. Playwright's
  `basic.spec.ts` still hits `/sections` and would fail locally against a real
  browser. Next session should either restore a minimal
  `apps/blackdot-dev/data/site.config.json` or repoint the playwright
  `webServer` target at `apps/blackdot-partners` (which already has the
  config). Not touched this session to honor "one thing only".
- **Playwright browsers cannot be installed in the sandboxed dev
  environment** (`cdn.playwright.dev` returns 403 "Host not allowed"). Vitest
  + local `next build` compile were used as the test gate; the Playwright
  spec was validated via `playwright test --list` (parses and lists 4 tests).
- **dds-platform Vercel project only deploys `main`.** Consider wiring
  preview deploys for `claude/*` session branches to unblock the session
  verification protocol.
