'use client';

/**
 * `WikiArticleRenderer` wires the default `@dds/renderer` registry together
 * with two additive wiki-specific plugins (`wiki-infobox`, `wiki-body`) and
 * hands the article's `UniversalSection[]` to `SectionBatchRenderer`.
 *
 * The core `@dds/renderer` package is untouched; this file is the seam
 * where wiki plugins plug in. If we ever add more wiki-native layouts
 * (citations, tables, footnotes…) they come in here.
 */

import { SectionBatchRenderer, createRegistry, defaultRegistry } from '@dds/renderer';
import { WikiInfobox } from './WikiInfobox';
import { WikiBody } from './WikiBody';

const WIKI_REGISTRY = createRegistry({
  ...defaultRegistry,
  'wiki-infobox': {
    component: WikiInfobox,
    metadata: {
      name: 'wiki-infobox',
      displayName: 'Wiki Infobox',
      description: 'Sidebar infobox: title, summary, labelled highlight rows.',
      layouts: ['wiki-infobox'],
    },
  },
  'wiki-body': {
    component: WikiBody,
    metadata: {
      name: 'wiki-body',
      displayName: 'Wiki Article Body',
      description: 'Article body section with heading, lede, and paragraphs.',
      layouts: ['wiki-body'],
    },
  },
});

export function WikiArticleRenderer({ sections }) {
  return <SectionBatchRenderer sections={sections} registry={WIKI_REGISTRY} />;
}
