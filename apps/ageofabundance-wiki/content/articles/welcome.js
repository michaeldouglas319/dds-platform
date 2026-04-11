/**
 * Seed wiki article — proves the universal section pipeline end-to-end.
 *
 * Authored as a plain ES module that exports an Article. Each `sections`
 * entry MUST be a valid `UniversalSection` from `@dds/types` so that the
 * existing `SectionBatchRenderer` and renderer registry render it without
 * any wiki-specific forks.
 *
 * @typedef {import('@dds/types').UniversalSection} UniversalSection
 * @typedef {{
 *   slug: string,
 *   title: string,
 *   summary: string,
 *   category?: string,
 *   updatedAt: string,
 *   sections: UniversalSection[],
 * }} Article
 */

/** @type {Article} */
export const welcome = {
  slug: 'welcome',
  title: 'Welcome to ageofabundance.wiki',
  summary:
    'A living, parametric encyclopedia of the post-scarcity transition — built on the universal section schema.',
  category: 'Meta',
  updatedAt: '2026-04-11',
  sections: [
    {
      id: 'welcome-intro',
      type: 'section',
      display: { layout: 'text', textAlign: 'start' },
      subject: {
        category: 'Overview',
        title: 'A living encyclopedia of abundance',
      },
      content: {
        body: 'ageofabundance.wiki is the long-form companion to the Age of Abundance constellation of sites. Every article on this wiki — including this one — is expressed as a sequence of universal sections, the same primitive that powers every other surface in the design system.',
        paragraphs: [
          {
            subtitle: 'Why a universal schema?',
            description:
              'A wiki article, an infobox, a hero, and a sidebar all describe the same thing: a subject, some content, and a layout hint. By forcing everything through one schema we keep the renderer plugin-shaped and the content portable. New article types do not require core changes — only new renderers.',
          },
          {
            subtitle: 'Backward compatible by construction',
            description:
              'The wiki ships entirely as additive code on top of @dds/renderer. The default registry continues to serve existing apps unchanged, and every wiki primitive is opt-in. If a renderer is missing, the batch renderer falls back gracefully.',
          },
        ],
      },
    },
    {
      id: 'welcome-pillars',
      type: 'section',
      display: { layout: 'text', textAlign: 'start' },
      subject: {
        category: 'Pillars',
        title: 'How the wiki is structured',
      },
      content: {
        body: 'Every article is a typed module. Sections are rendered through the same registry the rest of the platform uses, so any future renderer (callouts, figures, footnotes) automatically becomes available to wiki authors.',
        paragraphs: [
          {
            subtitle: 'Accessible by default',
            description:
              'Long-form measure capped at 75ch, AAA contrast on body copy, visible focus rings, semantic landmarks, and a screen-reader-navigable table of contents with aria-current.',
          },
          {
            subtitle: 'Parametric content',
            description:
              'Articles are data, not markup. The same article can be re-themed, re-laid-out, and re-skinned without rewriting a single section.',
          },
          {
            subtitle: 'Plugin renderers, never forks',
            description:
              'Wiki-specific primitives (infoboxes, callouts, footnotes) plug into the renderer registry. The core @dds/renderer package never has to know about the wiki.',
          },
        ],
      },
    },
    {
      id: 'welcome-next',
      type: 'section',
      display: { layout: 'text', textAlign: 'start' },
      subject: {
        category: 'Roadmap',
        title: 'What ships next',
      },
      content: {
        body: 'See the platform TODO.md for the full backlog. The next foundation items are wiki-link parsing, a static search index, and category indexes — each shipped as one focused session.',
      },
    },
  ],
};

/** @type {Article} */
export const universalSchema = {
  slug: 'universal-section-schema',
  title: 'The Universal Section schema',
  summary:
    'One TypeScript shape — subject, content, media, links, display, spatial — that describes every surface on the platform.',
  category: 'Architecture',
  updatedAt: '2026-04-11',
  sections: [
    {
      id: 'uss-intro',
      type: 'section',
      display: { layout: 'text', textAlign: 'start' },
      subject: {
        category: 'Architecture',
        title: 'One shape, every surface',
      },
      content: {
        body: 'The Universal Section schema is the contract between content and rendering on the dds platform. Heroes, articles, infoboxes, sidebars, tables of contents — every one of them is expressible as a UniversalSection.',
        paragraphs: [
          {
            subtitle: 'Buckets, not fields',
            description:
              'A section groups optional buckets: subject (what is this about), content (the words), media (the pixels), links (where to go next), display (how to lay it out), and spatial (3d hints). Renderers consume the buckets they understand and ignore the rest.',
          },
          {
            subtitle: 'Stable, additive evolution',
            description:
              'New fields are always optional with sensible defaults. Existing UniversalSection instances must continue to parse without changes — the schema only ever grows.',
          },
        ],
      },
    },
    {
      id: 'uss-rendering',
      type: 'section',
      display: { layout: 'text', textAlign: 'start' },
      subject: {
        category: 'Rendering',
        title: 'How a section becomes a DOM tree',
      },
      content: {
        body: 'The SectionBatchRenderer iterates a UniversalSection[] and looks up a renderer for each entry by display.layout, falling back to section.type. Renderers live in a hot-swappable registry, so apps can extend or override any layout without forking core.',
      },
    },
  ],
};
