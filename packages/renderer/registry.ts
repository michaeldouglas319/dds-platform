import type { RendererEntry, RendererRegistry } from '@dds/types';
import { HeroRenderer } from './renderers/hero-renderer';
import { TextRenderer } from './renderers/text-renderer';
import { StatsRenderer } from './renderers/stats-renderer';
import { FeatureMatrixRenderer } from './renderers/feature-matrix-renderer';
import { TimelineRenderer } from './renderers/timeline-renderer';
import { CTARenderer } from './renderers/cta-renderer';
import { TwoColumnRenderer } from './renderers/two-column-renderer';
import { SectorsGridRenderer } from './renderers/sectors-grid-renderer';
import { WikiArticleRenderer } from './renderers/wiki-article-renderer';

/**
 * Create a custom registry from a map of renderer entries.
 */
export function createRegistry(entries: Record<string, RendererEntry>): RendererRegistry {
  return { ...entries };
}

// ─── Default registry ────────────────────────────────────────────

const hero: RendererEntry = {
  component: HeroRenderer,
  metadata: {
    name: 'hero',
    displayName: 'Hero',
    description: 'Full viewport hero with title, subtitle, body and highlight badges',
    layouts: ['intro', 'hero'],
  },
};

const text: RendererEntry = {
  component: TextRenderer,
  metadata: {
    name: 'text',
    displayName: 'Text Section',
    description: 'Generic text section with title, body, and paragraphs',
    layouts: ['text', 'section'],
  },
};

const stats: RendererEntry = {
  component: StatsRenderer,
  metadata: {
    name: 'stats',
    displayName: 'Stats Grid',
    description: 'Grid of stat cards with label and value',
    layouts: ['stats-grid'],
  },
};

const featureMatrix: RendererEntry = {
  component: FeatureMatrixRenderer,
  metadata: {
    name: 'feature-matrix',
    displayName: 'Feature Matrix',
    description: 'Feature comparison table from highlights or items',
    layouts: ['feature-matrix'],
  },
};

const timeline: RendererEntry = {
  component: TimelineRenderer,
  metadata: {
    name: 'timeline',
    displayName: 'Timeline',
    description: 'Vertical timeline with colored dots and cards',
    layouts: ['timeline'],
  },
};

const cta: RendererEntry = {
  component: CTARenderer,
  metadata: {
    name: 'cta',
    displayName: 'Call to Action',
    description: 'Call-to-action with title, body, and button',
    layouts: ['cta'],
  },
};

const twoColumn: RendererEntry = {
  component: TwoColumnRenderer,
  metadata: {
    name: 'two-column',
    displayName: 'Two Column',
    description: 'Two-column layout for highlights',
    layouts: ['two-column'],
  },
};

const sectorsGrid: RendererEntry = {
  component: SectorsGridRenderer,
  metadata: {
    name: 'sectors-grid',
    displayName: 'Sectors Grid',
    description: 'Grid of sector cards from items',
    layouts: ['sectors-grid'],
  },
};

const wikiArticle: RendererEntry = {
  component: WikiArticleRenderer,
  metadata: {
    name: 'wiki-article',
    displayName: 'Wiki Article',
    description:
      'Long-form editorial article with semantic landmarks, slugged heading anchors, citations, and ≤75ch measure',
    layouts: ['wiki-article', 'article'],
    themeAware: true,
  },
};

export const defaultRegistry: RendererRegistry = createRegistry({
  // Hero variants
  intro: hero,
  hero: hero,
  // Text variants
  text: text,
  section: text,
  header: text,
  'text-only': text,
  // Stats
  'stats-grid': stats,
  // Feature matrix
  'feature-matrix': featureMatrix,
  // Timeline
  timeline: timeline,
  // CTA variants
  cta: cta,
  'centered-text': cta,
  // Layout
  'two-column': twoColumn,
  'sectors-grid': sectorsGrid,
  // Wiki
  'wiki-article': wikiArticle,
  article: wikiArticle,
});
