/**
 * Extended Core Types for Knowledge Graph
 *
 * Extends UniversalSection to support knowledge-graph layout types
 * and graph-specific metadata structures.
 *
 * @module @dds/renderer/core/types
 */

import type { UniversalSection } from '@dds/types';
import type { GraphData } from '../lib/graph-utils/types';

/**
 * KnowledgeGraphSection
 *
 * A specialized UniversalSection type for rendering knowledge graphs.
 * Used when display.layout = 'knowledge-graph'.
 *
 * Extends UniversalSection with:
 * - graph-specific display layout options
 * - graph data in the meta.graph field
 * - view type configuration
 */
export interface KnowledgeGraphSection extends Omit<UniversalSection, 'display' | 'meta'> {
  /** Type can be any standard section type */
  type?: UniversalSection['type'];

  /** Display configuration for graph visualization */
  display?: UniversalSection['display'] & {
    /** Layout type for knowledge graph views */
    layout?: 'knowledge-graph' | 'force-directed' | 'layered-universe' | 'globe' | 'entry-grid' | string;
  };

  /** Graph-specific metadata */
  meta?: UniversalSection['meta'] & {
    /** The knowledge graph data structure */
    graph?: GraphData;

    /** Primary view type to render */
    viewType?: 'force-directed' | 'layered-universe' | 'globe' | 'entry-grid';

    /** Whether to show multiple views */
    multiView?: boolean;

    /** Available views to show in view switcher */
    availableViews?: Array<'force-directed' | 'layered-universe' | 'globe' | 'entry-grid'>;

    /** Initial filter configuration */
    initialFilter?: {
      nodeTypes?: string[];
      tags?: string[];
      sources?: string[];
      searchQuery?: string;
    };

    /** Initial viewport configuration */
    initialViewport?: {
      zoom?: number;
      centerX?: number;
      centerY?: number;
    };

    /** View configuration defaults */
    viewConfig?: {
      showLabels?: boolean;
      showEdges?: boolean;
      edgeThickness?: number;
      nodeSize?: number;
      animationDuration?: number;
    };

    /** Additional graph metadata */
    [key: string]: unknown;
  };
}

/**
 * Type guard to check if a section is a KnowledgeGraphSection
 *
 * @param section UniversalSection to check
 * @returns true if section has knowledge-graph layout and graph data
 *
 * @example
 * ```tsx
 * if (isKnowledgeGraphSection(section)) {
 *   const graphData = section.meta?.graph;
 * }
 * ```
 */
export function isKnowledgeGraphSection(section: UniversalSection | KnowledgeGraphSection): section is KnowledgeGraphSection {
  return (
    (section.display?.layout === 'knowledge-graph' ||
      section.display?.layout === 'force-directed' ||
      section.display?.layout === 'layered-universe' ||
      section.display?.layout === 'globe') &&
    (section.meta as Record<string, unknown>)?.graph !== undefined
  );
}

/**
 * Type guard to check if a section has graph data
 *
 * @param section UniversalSection to check
 * @returns true if section has meta.graph defined
 */
export function hasGraphData(section: UniversalSection | KnowledgeGraphSection): section is KnowledgeGraphSection {
  return (section.meta as Record<string, unknown>)?.graph !== undefined;
}

/**
 * Helper to extract graph data from a section
 *
 * @param section UniversalSection
 * @returns GraphData or undefined
 */
export function getGraphData(section: UniversalSection): GraphData | undefined {
  if (hasGraphData(section)) {
    return (section.meta as Record<string, unknown>).graph as GraphData;
  }
  return undefined;
}

/**
 * Helper to check if a section should render a knowledge graph view
 *
 * @param section UniversalSection
 * @returns true if section is configured for graph rendering
 */
export function shouldRenderGraph(section: UniversalSection): boolean {
  const layoutKey = section.display?.layout;
  return (
    layoutKey === 'knowledge-graph' ||
    layoutKey === 'force-directed' ||
    layoutKey === 'layered-universe' ||
    layoutKey === 'globe'
  ) && hasGraphData(section);
}
