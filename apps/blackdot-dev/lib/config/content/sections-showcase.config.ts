/**
 * Sections Showcase Configuration
 *
 * Demonstrates all layout types with particle morphing transitions
 * - scroll-based: Vertical scrolling with anchored content
 * - grid: Multi-column grid layout
 * - carousel: Horizontal carousel/slider
 * - timeline: Sequential timeline with branching
 * - gallery: Image/model gallery with details
 */

import { UnifiedSection } from './sections.config';

export const sectionsShowcase: UnifiedSection[] = [
  // ============================================================================
  // SCROLL-BASED LAYOUT
  // ============================================================================
  {
    id: 'showcase-scroll',
    page: 'personal',
    title: 'Scroll-Based Section',
    subtitle: 'Vertical scrolling with anchored content',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    layout: { type: 'scroll-based', variant: 'compact' },
    drilldown: { enabled: false },
    modelConfig: {
      path: '/assets/models/golden_globe_decoration.glb',
      scale: 0.8,
      position: [0, 0, 0],
      animation: { type: 'rotate', speed: 0.5 }
    },
    content: {
      heading: 'Scroll-Based Layout',
      paragraphs: [
        {
          subtitle: 'Content Anchoring',
          description: 'Content stays anchored while you scroll through narrative sections. Perfect for storytelling and progressive disclosure of information.'
        },
        {
          subtitle: 'Use Cases',
          description: 'Long-form content, step-by-step guides, linear narratives with fixed visual elements.'
        }
      ],
      highlights: [
        'Smooth scrolling triggers',
        'Parallax effects optional',
        'Sticky headers and footers',
        'Progressive loading'
      ]
    }
  },

  // ============================================================================
  // GRID LAYOUT
  // ============================================================================
  {
    id: 'showcase-grid',
    page: 'personal',
    title: 'Grid Section',
    subtitle: 'Multi-column responsive grid',
    position: [2.5, 0, 0],
    rotation: [0, Math.PI / 6, 0],
    layout: { type: 'grid', variant: 'expanded' },
    drilldown: { enabled: false },
    modelConfig: {
      path: '/assets/models/chess_set_draco.glb',
      scale: 0.9,
      position: [0, 0, 0],
      animation: { type: 'float', speed: 1.0, amplitude: 0.3 }
    },
    content: {
      heading: 'Grid Layout',
      paragraphs: [
        {
          subtitle: 'Responsive Columns',
          description: 'Automatically adapts from 1 column on mobile to 3-4 columns on desktop. Great for showcasing multiple items.'
        },
        {
          subtitle: 'Content Cards',
          description: 'Each grid item can be a card, image, or content block with independent interactions.'
        }
      ],
      highlights: [
        'Auto-responsive columns',
        'Gap and padding controls',
        'Card-based components',
        'Hover effects'
      ]
    }
  },

  // ============================================================================
  // CAROUSEL LAYOUT
  // ============================================================================
  {
    id: 'showcase-carousel',
    page: 'personal',
    title: 'Carousel Section',
    subtitle: 'Horizontal sliding carousel',
    position: [-2.5, 0, 0],
    rotation: [0, -Math.PI / 6, 0],
    layout: { type: 'carousel', variant: 'compact' },
    drilldown: { enabled: false },
    modelConfig: {
      path: '/assets/models/building_draco.glb',
      scale: 1.0,
      position: [0, 0, 0],
      animation: { type: 'rotate', speed: 0.3 }
    },
    content: {
      heading: 'Carousel Layout',
      paragraphs: [
        {
          subtitle: 'Horizontal Scrolling',
          description: 'Navigate through items using arrows or swipe gestures. Perfect for showcasing similar items side-by-side.'
        },
        {
          subtitle: 'Touch Support',
          description: 'Built-in swipe detection for mobile devices with smooth deceleration physics.'
        }
      ],
      highlights: [
        'Touch/swipe controls',
        'Keyboard navigation',
        'Auto-advance optional',
        'Dot indicators'
      ]
    }
  },

  // ============================================================================
  // TIMELINE LAYOUT
  // ============================================================================
  {
    id: 'showcase-timeline',
    page: 'personal',
    title: 'Timeline Section',
    subtitle: 'Sequential timeline with markers',
    position: [0, 2.5, 0],
    rotation: [Math.PI / 8, 0, 0],
    layout: { type: 'timeline', variant: 'expanded' },
    drilldown: { enabled: false },
    modelConfig: {
      path: '/assets/models/assembly_line_gltf/scene.gltf',
      scale: 0.7,
      position: [0, 0, 0],
      animation: { type: 'rotate', speed: 0.2 }
    },
    content: {
      heading: 'Timeline Layout',
      paragraphs: [
        {
          subtitle: 'Sequential Progression',
          description: 'Display chronological events or process steps with visual connections. Each milestone can have associated metadata.'
        },
        {
          subtitle: 'Branching Paths',
          description: 'Support multiple parallel timelines or decision branches within a single narrative flow.'
        }
      ],
      highlights: [
        'Chronological markers',
        'Vertical or horizontal orientation',
        'Milestone cards',
        'Connection visualizations'
      ]
    }
  },

  // ============================================================================
  // GALLERY LAYOUT
  // ============================================================================
  {
    id: 'showcase-gallery',
    page: 'personal',
    title: 'Gallery Section',
    subtitle: 'Image and model gallery',
    position: [0, -2.5, 0],
    rotation: [-Math.PI / 8, 0, 0],
    layout: { type: 'gallery', variant: 'compact' },
    drilldown: { enabled: false },
    modelConfig: {
      path: '/assets/models/super_cam__-_rusian_reconnaissance_drone_draco.glb',
      scale: 1.2,
      position: [0, 0, 0],
      animation: { type: 'float', speed: 0.8, amplitude: 0.4 }
    },
    content: {
      heading: 'Gallery Layout',
      paragraphs: [
        {
          subtitle: 'Media Showcase',
          description: 'Display images, videos, and 3D models in a beautiful gallery format. Supports lightbox, full-screen, and detail views.'
        },
        {
          subtitle: 'Filtering and Sorting',
          description: 'Built-in support for categorizing items and allowing viewers to filter by tags or properties.'
        }
      ],
      highlights: [
        'Masonry or grid layouts',
        'Lightbox/modal viewers',
        'Tag-based filtering',
        'Detail view transitions'
      ]
    }
  }
];
