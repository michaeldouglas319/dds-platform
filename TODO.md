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
  from the existing `blackdot-dev` suite. All 7 wiki e2e specs pass locally
  and `next build` statically generates every article route.
  Commit `f72dac76d599de8f8aec86e7911792d4ace8762b` pushed to
  `origin/claude/fervent-hopper-dIZwH`. Production Vercel verification was
  not in-path this session: the root `vercel.json` filters the
  `dds-platform` Vercel project to `@dds/blackdot-partners`, and the
  `ageofabundance-wiki` Vercel project currently tracks a different repo.
  Re-pointing deployment for `ageofabundance.wiki` is itself a follow-up
  item (see below).

## Follow-ups discovered this session

* Reconcile the `ageofabundance-wiki` Vercel project's upstream repo —
  it currently tracks `theageofabundance-platform`, not `dds-platform`,
  so wiki work in this monorepo does not reach the `ageofabundance.wiki`
  domain until that pointer is fixed (or a new Vercel project is wired
  to `apps/ageofabundance-wiki`).
* Root `vercel.json` hard-codes
  `--filter=@dds/blackdot-partners` as the build command. Consider a
  per-app deploy config so additional apps in the monorepo can ship
  independently without editing root config on every session.
* Checked-in Playwright browser cache is `chromium-1194`, which matches
  `@playwright/test@1.56.x`. Newer Playwright versions require a
  different browser bundle that the environment cannot download. If the
  team wants to upgrade Playwright, they must also refresh
  `/opt/pw-browsers`. Pinning to `1.56.1` in `package.json` is the
  workaround applied this session.
