import type { RendererEntry, RendererRegistry } from '@dds/types';
import { HeroRenderer } from './renderers/hero-renderer';
import { TextRenderer } from './renderers/text-renderer';
import { StatsRenderer } from './renderers/stats-renderer';
import { FeatureMatrixRenderer } from './renderers/feature-matrix-renderer';
import { TimelineRenderer } from './renderers/timeline-renderer';
import { CTARenderer } from './renderers/cta-renderer';
import { TwoColumnRenderer } from './renderers/two-column-renderer';
import { SectorsGridRenderer } from './renderers/sectors-grid-renderer';
import { EntryHighlightRenderer } from './renderers/entry-highlight-renderer';
import { EntryGridRenderer } from './renderers/entry-grid-renderer';
import { KnowledgeGraphSection } from './renderers/knowledge-graph-section';
import { CarouselR3F } from './renderers/carousel-r3f';
import { CodeDiffR3F } from './renderers/code-diff-r3f';
import { IntroR3F } from './renderers/intro-r3f';

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

const entryHighlight: RendererEntry = {
  component: EntryHighlightRenderer,
  metadata: {
    name: 'entry-highlight',
    displayName: 'Entry Highlight',
    description: 'Single featured entry card (UniversalSection-shaped)',
    layouts: ['entry-highlight'],
  },
};

const entryGrid: RendererEntry = {
  component: EntryGridRenderer,
  metadata: {
    name: 'entry-grid',
    displayName: 'Entry Grid',
    description: 'Grid of entry cards; content.items holds an array of UniversalSection cards',
    layouts: ['entry-grid'],
  },
};

const knowledgeGraph: RendererEntry = {
  component: KnowledgeGraphSection,
  metadata: {
    name: 'knowledge-graph',
    displayName: 'Interactive Knowledge Graph',
    description:
      'Multi-view graph visualization with globe, force-directed, grid, and layered layouts. Supports node selection, filtering, and interactive exploration.',
    required: {
      content: ['nodes', 'edges'],
    },
    optional: {
      subject: ['title', 'subtitle'],
      display: ['graphView'],
    },
    layouts: ['knowledge-graph'],
    composable: true,
  },
};

// ─── Interactive R3F Renderers ──────────────────────────────────

const carouselR3F: RendererEntry = {
  component: CarouselR3F,
  metadata: {
    name: 'carousel-r3f',
    displayName: 'Interactive 3D Carousel',
    description: 'Interactive 3D carousel with prev/next navigation and circular image arrangement',
    required: {
      media: ['image'],
    },
    optional: {
      meta: ['autoplay', 'itemCount'],
    },
    layouts: ['carousel', 'carousel-r3f'],
  },
};

const codeDiffR3F: RendererEntry = {
  component: CodeDiffR3F,
  metadata: {
    name: 'code-diff-r3f',
    displayName: 'Interactive Code Diff',
    description: 'Side-by-side or stacked code comparison with toggle view',
    required: {
      content: ['body'],
    },
    optional: {
      content: ['items'],
      meta: ['language', 'lineNumbers'],
    },
    layouts: ['code-diff', 'code-diff-r3f'],
  },
};

const introR3F: RendererEntry = {
  component: IntroR3F,
  metadata: {
    name: 'intro-r3f',
    displayName: 'Animated Intro Section',
    description: 'Full-page intro with staggered text reveal and morphing geometry background',
    optional: {
      subject: ['title', 'subtitle'],
      content: ['body'],
      display: ['animate', 'animationDuration'],
      meta: ['staggerDelay'],
    },
    layouts: ['intro-animated', 'intro-r3f'],
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
  // Entry cards (knowledge table)
  'entry-highlight': entryHighlight,
  'entry-grid': entryGrid,
  // Knowledge graph (multi-view graph visualization)
  'knowledge-graph': knowledgeGraph,
  // Interactive R3F Renderers
  'carousel-r3f': carouselR3F,
  carousel: carouselR3F,
  'code-diff-r3f': codeDiffR3F,
  'code-diff': codeDiffR3F,
  'intro-r3f': introR3F,
  'intro-animated': introR3F,
});
