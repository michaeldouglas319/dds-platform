# Wiki backlog

The journal for the `ageofabundance.wiki` consumer app built on top of
`@dds/renderer`. One focused thing per session, schema-driven, plugin-first,
backwards-compatible. Mark items DONE with a one-line summary + commit SHA;
mark REVERTED with the root-cause hypothesis so the next session starts
smarter.

## Architectural ground rules

- Every wiki page, sidebar, infobox, and TOC is a `UniversalSection`.
- Wiki-specific renderers are **plugins** composed via
  `createRegistry({ ...defaultRegistry, ... })` — never fork `@dds/renderer` core
  and never mutate `defaultRegistry`.
- New props on shared types must be optional with sensible defaults.
- Long-form measure ≤ 75ch; line-height ≥ 1.5; AAA on body where feasible.
- All colors and spacing flow through CSS custom properties so the 9 theme
  variants compose without renderer changes.
- `prefers-reduced-motion` guards every animation.
- At least one Playwright golden-path test per new feature.

---

## Done

- [x] **Wiki article foundation primitive** — `WikiArticleRenderer` plugin
  registered additively under `display.layout: 'wiki-article'`, sample home
  article driven by a typed `UniversalSection`, semantic `<main>` / `<article>`
  with `aria-labelledby`, configurable heading levels, key-facts aside,
  related-topics nav, editorial CSS tokens with AAA dark/light palettes,
  prefers-reduced-motion guard, ≤75ch measure, 44px touch targets.
  Vitest: 11 new tests. Playwright: 5 new tests under `e2e/wiki/`.
  *Session SHA: see commit log on branch claude/fervent-hopper-kEa5W.*

## Next up — content model & navigation (highest value)

- [ ] **Filesystem-driven topic loader** — replace the hand-coded
  `data/home-article.ts` with a glob over `apps/ageofabundance-wiki/content/*.md`
  parsed into `UniversalSection` records via gray-matter (frontmatter →
  `subject`/`display`, body → `content.paragraphs`). Static-generate via
  `generateStaticParams`.
- [ ] **Article route** — add `app/[slug]/page.tsx` rendering one wiki article
  per slug from the loader. 404 handler returns the existing `wiki-article`
  layout populated with the "broken link" empty state.
- [ ] **Wiki-link parser plugin** — parse `[[Topic Title]]` and
  `[[slug|display]]` inside paragraph descriptions, resolve against the topic
  index, render `<a href="/slug">` with `aria-current="page"` when on the
  target. Unknown links rendered with `data-state="broken"` and AAA-contrast
  warning styling.
- [ ] **WikiTocRenderer plugin** — sidebar/aside renderer that emits an
  in-page table of contents from `content.paragraphs` headings, `<nav>` with
  `aria-label="On this page"`, sticky on desktop, collapsed disclosure on
  mobile.
- [ ] **WikiCategoryIndexRenderer** — landing-style listing of all topics in a
  category, schema-driven via `subject.category`.
- [ ] **Home page reorganization** — rebuild `/` as a category-aware landing
  composed of multiple `UniversalSection` records: hero + featured articles +
  category index. Demonstrates plugin composition through `SectionBatchRenderer`.

## Search & graph

- [ ] **Pagefind static index** at build time — runs after `next build` and
  outputs to `/_pagefind`. Search bar in layout reads it client-side.
- [ ] **Backlink computation** — at build time, walk all wiki-link references
  and emit a per-topic backlinks JSON. New `WikiBacklinksRenderer` plugin
  consumes it.
- [ ] **Graph view** — D3-force or pixijs visualization, lazy-loaded, dispose
  on unmount, prefers-reduced-motion respected (static fallback).

## Editorial / revisions

- [ ] **Revisions metadata** — surface git history per article via the GitHub
  REST API at build time, render in a "History" disclosure beneath each
  article.
- [ ] **Citation footnote primitive** — promote inline citations to numbered
  footnotes with backlinks; AAA-contrast tooltip on hover/focus.
- [ ] **Editorial review checklist** — pre-publish lint that runs on PRs:
  measure check, alt text presence, link integrity, contrast budget.

## Infrastructure / cleanup

- [ ] **Pre-existing**: `e2e/basic.spec.ts` asserts content (`View All
  Sections`, `Demo Page`, theme variants) that the placeholder
  `apps/blackdot-dev` page no longer renders. Either restore the showcase home
  page or skip the suite. Out of scope for the current focused session;
  avoided touching `playwright.config.ts` to preserve baseline.
- [ ] **Vercel deploy filter**: `vercel.json` only builds
  `@dds/blackdot-partners`. To make the wiki actually serve from
  `ageofabundance.wiki`, the dds-platform Vercel project will need either a
  multi-app routing strategy or a dedicated wiki Vercel project pointing at
  this repo. Recorded for the next session.
- [ ] **Vercel feature-branch deploys**: the dds-platform Vercel project does
  not currently auto-deploy from non-`main` branches — recent deploys are all
  CLI-driven (`source: cli`) on `main` only. As a result the wiki feature
  shipped this session is verifiable locally but cannot be exercised on a
  Vercel preview URL until the project's Git integration is enabled for
  feature branches (or until the wiki app gets its own Vercel project pointing
  at this repo). Until then "verify in production via Vercel" is fulfilled by
  the next push to `main`.
- [ ] **Wiki app dependency hygiene** — `@tailwindcss/postcss`, `postcss`, and
  `tailwindcss` remain in `apps/ageofabundance-wiki/package.json` even though
  the wiki uses raw CSS only. Drop them in a follow-up once nothing else
  imports tailwind from the wiki tree.

## Schema extensions proposed (deferred)

- `content.toc?: { depth?: 1 | 2 | 3 }` — TOC plugin would consume this for
  cleaner authoring than walking `paragraphs`.
- `subject.slug?: string` — explicit slug override for wiki-link resolution
  when the title differs from the URL.
- `meta.revisions?: Array<{ sha, author, date, message }>` — revisions
  primitive payload, populated at build time, never authored by hand.

> Schema extensions must remain optional and additive — never break existing
> `UniversalSection` consumers.

## Reverted

(none yet)
