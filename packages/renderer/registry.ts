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
import { CardsR3F } from './renderers/cards-r3f';
import { TextR3F } from './renderers/text-r3f';
import { CenteredTextR3F } from './renderers/centered-text-r3f';
import { GlobeR3F } from './renderers/globe-r3f';
import { EarthR3F } from './renderers/earth-r3f';
import { ModelR3F } from './renderers/model-r3f';
import { ThemeShowcaseRenderer } from './renderers/theme-showcase';

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

// ─── Interactive R3F Renderers (Phase 1) ──────────────────────────

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

// ─── Layout R3F Renderers (Phase 2) ──────────────────────────────

const cardsR3F: RendererEntry = {
  component: CardsR3F,
  metadata: {
    name: 'cards-r3f',
    displayName: '3D Card Grid',
    description: 'Interactive 3D grid of card components with hover effects and theme-aware colors',
    optional: {
      subject: ['title', 'subtitle'],
      content: ['items'],
      meta: ['columns', 'cardWidth', 'cardHeight'],
    },
    layouts: ['cards', 'cards-r3f'],
  },
};

const textR3F: RendererEntry = {
  component: TextR3F,
  metadata: {
    name: 'text-r3f',
    displayName: '3D Text Block',
    description: 'Multi-paragraph text with 3D background animation and responsive typography',
    optional: {
      subject: ['title', 'subtitle', 'category'],
      content: ['body', 'paragraphs'],
      display: ['textAlign', 'textWidth'],
    },
    layouts: ['text-r3f', 'text-3d'],
  },
};

const centeredTextR3F: RendererEntry = {
  component: CenteredTextR3F,
  metadata: {
    name: 'centered-text-r3f',
    displayName: '3D Centered Text',
    description: 'Centered text with animated reveal and morphing geometry background',
    optional: {
      subject: ['title', 'subtitle'],
      content: ['body'],
      display: ['contentWidth'],
      meta: ['staggerDelay', 'animationDuration'],
    },
    layouts: ['centered-text-r3f', 'centered-3d'],
  },
};

// ─── Spatial R3F Renderers (Phase 2) ──────────────────────────────
/**
 * Globe: Rotating 3D sphere with optional markers and labels
 * Supports auto-rotation, camera positioning, and theme-aware colors
 */
const globeR3F: RendererEntry = {
  component: GlobeR3F,
  metadata: {
    name: 'globe-r3f',
    displayName: 'Rotating 3D Globe',
    description: 'Rotating 3D sphere with optional markers/labels. Uses Three.js primitives with responsive sizing.',
    optional: {
      subject: ['title', 'subtitle', 'description', 'color'],
      spatial: ['autoRotate', 'camera', 'position', 'rotation', 'scale'],
      display: ['layout'],
    },
    layouts: ['globe', 'globe-r3f'],
  },
};

/**
 * Earth: Earth-like 3D visualization with atmosphere effect
 * Supports auto-rotation, event markers, and responsive camera
 */
const earthR3F: RendererEntry = {
  component: EarthR3F,
  metadata: {
    name: 'earth-r3f',
    displayName: 'Earth Visualization',
    description: 'Earth-like 3D sphere with atmosphere glow and rotating surface. Supports event markers with lat/lon positioning.',
    optional: {
      subject: ['title', 'subtitle', 'description', 'color'],
      spatial: ['autoRotate', 'camera'],
      meta: ['events'],
      display: ['layout'],
    },
    layouts: ['earth', 'earth-r3f'],
  },
};

/**
 * Model: Generic 3D model viewer with full spatial control
 * Supports positioning, rotation, scaling, and OrbitControls
 */
const modelR3F: RendererEntry = {
  component: ModelR3F,
  metadata: {
    name: 'model-r3f',
    displayName: '3D Model Viewer',
    description: 'Generic 3D model viewer with position/rotation/scale control. Supports multiple geometry types and interactive camera.',
    optional: {
      subject: ['title', 'subtitle', 'description', 'color'],
      spatial: ['position', 'rotation', 'scale', 'autoRotate', 'camera', 'modelType', 'meshes', 'hideMeshes'],
      display: ['layout'],
    },
    layouts: ['model', 'model-r3f'],
  },
};

/**
 * Theme Showcase: Unified design system demonstration
 * Shows shadcn/ui components and Three.js scene using shared CSS tokens
 * Demonstrates automatic theme switching affecting both UI and 3D simultaneously
 */
const themeShowcase: RendererEntry = {
  component: ThemeShowcaseRenderer,
  metadata: {
    name: 'theme-showcase',
    displayName: 'Theme Showcase',
    description:
      'Interactive demonstration of the unified design system. Shows shadcn/ui components and a Three.js scene sharing CSS tokens with live theme switching.',
    optional: {
      subject: ['title', 'subtitle'],
      content: ['body'],
      spatial: ['autoRotate'],
    },
    layouts: ['theme-showcase', 'design-system'],
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
  // Entry cards (knowledge table)
  'entry-highlight': entryHighlight,
  'entry-grid': entryGrid,
  // Knowledge graph (multi-view graph visualization)
  'knowledge-graph': knowledgeGraph,
  // Interactive R3F Renderers - Phase 1
  'carousel-r3f': carouselR3F,
  carousel: carouselR3F,
  'code-diff-r3f': codeDiffR3F,
  'code-diff': codeDiffR3F,
  'intro-r3f': introR3F,
  'intro-animated': introR3F,
  // Layout R3F Renderers - Phase 2
  'cards-r3f': cardsR3F,
  cards: cardsR3F,
  'text-r3f': textR3F,
  'text-3d': textR3F,
  'centered-text-r3f': centeredTextR3F,
  'centered-3d': centeredTextR3F,
  // Spatial R3F Renderers - Phase 2
  'globe-r3f': globeR3F,
  globe: globeR3F,
  'earth-r3f': earthR3F,
  earth: earthR3F,
  'model-r3f': modelR3F,
  model: modelR3F,
  // Unified Design System Showcase
  'theme-showcase': themeShowcase,
  'design-system': themeShowcase,
});
