/**
 * Maps ideas configuration (UnifiedSection) to 3D scene structure
 *
 * Transforms UnifiedSection content into MappedSlideContent suitable for
 * Three.js rendering, handling layout calculations, text positioning, and
 * responsive scaling based on viewport breakpoint.
 */

import type { UnifiedSection } from '@/lib/config/content/sections.config';
import type { Breakpoint } from '@/lib/hooks/useResponsiveCanvas';

export interface MappedSlideContent {
  title: string;
  subtitle?: string;
  backgroundGeometry?: {
    type: 'plane' | 'box' | 'sphere' | 'gradient';
    color?: string;
    scale: number;
  };
  textElements: Array<{
    id: string;
    content: string;
    type: 'title' | 'subtitle' | 'paragraph' | 'highlight' | 'stat';
    position: [number, number, number];
    scale: number;
    color?: string;
  }>;
  modelElement?: {
    path: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
    animation: {
      type: string;
      speed: number;
    };
  };
  cards: Array<{
    id: string;
    title: string;
    description: string;
    position: [number, number, number];
    color?: string;
  }>;
}

/**
 * Maps a UnifiedSection configuration to 3D slide content
 *
 * Handles:
 * - Title and subtitle positioning
 * - Content text layout with responsive scaling
 * - Model placement and animation setup
 * - Card/highlight positioning based on breakpoint
 * - Background geometry selection
 *
 * @param slide - The UnifiedSection to map
 * @param breakpoint - Current responsive breakpoint ('mobile' | 'tablet' | 'desktop')
 * @returns MappedSlideContent ready for Three.js rendering
 */
export function mapSlideToContent(
  slide: UnifiedSection,
  breakpoint: Breakpoint
): MappedSlideContent {
  const textSettings = getTextSettings(breakpoint);
  const positions = getElementPositions(
    (slide.content.highlights?.length || 0) + (slide.content.stats?.length || 0),
    breakpoint
  );

  // Map title and subtitle
  const title = slide.title;
  const subtitle = slide.subtitle;

  // Map content paragraphs to text elements
  const textElements: MappedSlideContent['textElements'] = [];

  // Add title element
  textElements.push({
    id: `${slide.id}-title`,
    content: slide.content.heading,
    type: 'title',
    position: getTitlePosition(breakpoint),
    scale: textSettings.fontSize * 1.2,
    color: slide.color || '#ffffff'
  });

  // Add subtitle if exists
  if (subtitle) {
    textElements.push({
      id: `${slide.id}-subtitle`,
      content: subtitle,
      type: 'subtitle',
      position: getSubtitlePosition(breakpoint),
      scale: textSettings.fontSize * 0.9,
      color: slide.color || '#ffffff'
    });
  }

  // Add paragraphs
  if (slide.content.paragraphs) {
    slide.content.paragraphs.forEach((para, index) => {
      const paraContent = typeof para === 'string' ? para : para.description;
      if (paraContent) {
        textElements.push({
          id: `${slide.id}-para-${index}`,
          content: paraContent,
          type: 'paragraph',
          position: getParagraphPosition(index, breakpoint),
          scale: textSettings.fontSize * 0.8,
          color: '#ffffff'
        });
      }
    });
  }

  // Map highlights and stats to cards
  const cards: MappedSlideContent['cards'] = [];

  if (slide.content.highlights) {
    slide.content.highlights.forEach((highlight, index) => {
      const highlightContent = typeof highlight === 'string'
        ? highlight
        : highlight.description;
      const highlightTitle = typeof highlight === 'string'
        ? `Highlight ${index + 1}`
        : highlight.subtitle || `Highlight ${index + 1}`;

      cards.push({
        id: `${slide.id}-highlight-${index}`,
        title: highlightTitle,
        description: highlightContent,
        position: positions[index] || [0, 0, 0],
        color: deriveCardColor(index)
      });
    });
  }

  if (slide.content.stats) {
    const startIndex = slide.content.highlights?.length || 0;
    slide.content.stats.forEach((stat, index) => {
      cards.push({
        id: `${slide.id}-stat-${index}`,
        title: stat.label,
        description: stat.value,
        position: positions[startIndex + index] || [0, 0, 0],
        color: deriveStatColor(index)
      });
    });
  }

  // Map model configuration
  const modelElement = slide.modelConfig ? {
    path: slide.modelConfig.path || '',
    position: slide.modelConfig.position || [0, 0, 0],
    rotation: slide.modelConfig.rotation || [0, 0, 0],
    scale: slide.modelConfig.scale || 1,
    animation: {
      type: slide.modelConfig.animation?.type || 'none',
      speed: slide.modelConfig.animation?.speed || 1
    }
  } : undefined;

  // Select background geometry based on breakpoint and content
  const backgroundGeometry = selectBackgroundGeometry(slide, breakpoint);

  return {
    title,
    subtitle,
    backgroundGeometry,
    textElements,
    modelElement,
    cards
  };
}

/**
 * Get layout positions for content elements based on breakpoint
 *
 * Returns array of [x, y, z] positions for cards/highlights
 * - Mobile: vertical stack (1 column)
 * - Tablet: 2-column grid
 * - Desktop: distributed layout (3-4 columns)
 *
 * @param elementCount - Number of elements to position
 * @param breakpoint - Current responsive breakpoint
 * @returns Array of [x, y, z] positions
 */
export function getElementPositions(
  elementCount: number,
  breakpoint: Breakpoint
): Array<[number, number, number]> {
  if (elementCount === 0) {
    return [];
  }

  const positions: Array<[number, number, number]> = [];

  if (breakpoint === 'mobile') {
    // Mobile: vertical stack (1 column, centered)
    for (let i = 0; i < elementCount; i++) {
      const y = 3 - i * 1.5;
      positions.push([0, y, 0]);
    }
  } else if (breakpoint === 'tablet') {
    // Tablet: 2-column grid
    for (let i = 0; i < elementCount; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? -1.5 : 1.5;
      const y = 3 - row * 1.8;
      positions.push([x, y, 0]);
    }
  } else {
    // Desktop: 3-4 column distributed layout
    const cols = Math.min(elementCount, 4);
    for (let i = 0; i < elementCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = (col - (cols - 1) / 2) * 2.5;
      const y = 3 - row * 1.5;
      positions.push([x, y, 0]);
    }
  }

  return positions;
}

/**
 * Get text rendering settings for a given breakpoint
 *
 * Returns font size, max width, and color configuration
 * scaled appropriately for the viewport
 *
 * @param breakpoint - Current responsive breakpoint
 * @returns Text settings object with fontSize, maxWidth, color
 */
export function getTextSettings(breakpoint: Breakpoint) {
  return {
    fontSize: breakpoint === 'mobile' ? 0.5 : breakpoint === 'tablet' ? 0.7 : 1,
    maxWidth: breakpoint === 'mobile' ? 4 : breakpoint === 'tablet' ? 6 : 10,
    color: '#ffffff'
  };
}

/**
 * Get title position based on breakpoint
 * - Mobile: higher up, smaller scale
 * - Desktop: centered with more space
 */
function getTitlePosition(breakpoint: Breakpoint): [number, number, number] {
  if (breakpoint === 'mobile') {
    return [0, 3.5, 0];
  } else if (breakpoint === 'tablet') {
    return [0, 4, 0];
  } else {
    return [0, 4.5, 0];
  }
}

/**
 * Get subtitle position based on breakpoint
 */
function getSubtitlePosition(breakpoint: Breakpoint): [number, number, number] {
  if (breakpoint === 'mobile') {
    return [0, 3, 0];
  } else if (breakpoint === 'tablet') {
    return [0, 3.5, 0];
  } else {
    return [0, 4, 0];
  }
}

/**
 * Get paragraph position based on index and breakpoint
 */
function getParagraphPosition(
  index: number,
  breakpoint: Breakpoint
): [number, number, number] {
  if (breakpoint === 'mobile') {
    return [0, 2.5 - index * 0.6, 0];
  } else if (breakpoint === 'tablet') {
    return [0, 3 - index * 0.7, 0];
  } else {
    return [0, 3.5 - index * 0.8, 0];
  }
}

/**
 * Select background geometry based on slide content and breakpoint
 */
function selectBackgroundGeometry(
  slide: UnifiedSection,
  breakpoint: Breakpoint
) {
  // Default: gradient background
  return {
    type: 'gradient' as const,
    scale: breakpoint === 'mobile' ? 0.8 : breakpoint === 'tablet' ? 1 : 1.2
  };
}

/**
 * Derive card color from index (cycles through palette)
 */
function deriveCardColor(index: number): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899'  // pink
  ];
  return colors[index % colors.length];
}

/**
 * Derive stat color from index (uses different palette)
 */
function deriveStatColor(index: number): string {
  const colors = [
    '#06B6D4', // cyan
    '#14B8A6', // teal
    '#84CC16', // lime
    '#F97316', // orange
    '#6366F1', // indigo
    '#D946EF'  // fuchsia
  ];
  return colors[index % colors.length];
}
