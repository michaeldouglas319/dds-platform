'use client';

/**
 * Layered Universe View Component
 *
 * Organizes nodes into horizontal layers based on type, creating a stratified
 * visualization where different node types occupy distinct Z-axis layers.
 * Provides a clear hierarchical view of the graph structure.
 *
 * @module @dds/renderer/lib/graph-views/layered-universe-view
 */

import React, { Suspense, useRef, useMemo, useCallback } from 'react';
import type { GraphNode, GraphEdge } from '../../graph-utils/types';
import { useGraphView, useGraphViewFilter } from '../../graph-utils/context';
import { GraphLoadingSpinner } from '../../components';
import { LayerVisualization } from './LayerVisualization';
import styles from './layered-universe-view.module.css';

/**
 * Configuration for LayeredUniverseView
 */
export interface LayeredUniverseViewConfig {
  /** Show node labels (default: true) */
  showLabels?: boolean;
  /** Show edges/connections (default: true) */
  showEdges?: boolean;
  /** Node size in pixels (default: 40) */
  nodeSize?: number;
  /** Canvas width in pixels (default: 1200) */
  width?: number;
  /** Canvas height in pixels (default: 600) */
  height?: number;
  /** Gap between layers in pixels (default: 80) */
  layerGap?: number;
  /** Horizontal spacing between nodes in pixels (default: 60) */
  nodeSpacing?: number;
  /** Show layer labels (default: true) */
  showLayerLabels?: boolean;
}

/**
 * Props for LayeredUniverseView component
 */
export interface LayeredUniverseViewProps {
  /** Array of graph nodes to display */
  nodes: GraphNode[];
  /** Array of edges for connections */
  edges: GraphEdge[];
  /** Configuration options */
  config?: LayeredUniverseViewConfig;
  /** Optional CSS class for container */
  className?: string;
}



/**
 * LayeredUniverseView - Stratified graph visualization with type-based layers
 *
 * Organizes nodes into horizontal layers based on their type, creating
 * a clear visual hierarchy. Each layer represents a different node type.
 * Supports selection, filtering, and interactive controls.
 *
 * Features:
 * - Type-based layer organization
 * - Horizontal stratified layout
 * - Node labels with hover effects
 * - Type-based styling and colors
 * - Responsive to filter changes
 * - Accessibility-first design
 *
 * @example
 * ```tsx
 * <LayeredUniverseView
 *   nodes={visibleNodes}
 *   edges={edges}
 *   config={{
 *     nodeSize: 40,
 *     width: 1200,
 *     height: 600,
 *     showLabels: true,
 *   }}
 * />
 * ```
 */
export const LayeredUniverseView: React.FC<LayeredUniverseViewProps> = ({
  nodes,
  edges,
  config = {},
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { filteredData } = useGraphViewFilter();

  // Merge with defaults
  const mergedConfig: Required<LayeredUniverseViewConfig> = useMemo(
    () => ({
      showLabels: config.showLabels ?? true,
      showEdges: config.showEdges ?? true,
      nodeSize: config.nodeSize ?? 40,
      width: config.width ?? 1200,
      height: config.height ?? 600,
      layerGap: config.layerGap ?? 80,
      nodeSpacing: config.nodeSpacing ?? 60,
      showLayerLabels: config.showLayerLabels ?? true,
    }),
    [config]
  );

  // Use filtered data if available, otherwise use all nodes/edges
  const displayNodes = filteredData.nodes.length > 0 ? filteredData.nodes : nodes;
  const displayEdges = filteredData.edges.length > 0 ? filteredData.edges : edges;

  if (displayNodes.length === 0) {
    return (
      <div className={`${styles.emptyState} ${className}`}>
        <p>No nodes to display</p>
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${className}`}
      ref={containerRef}
      style={{
        width: `${mergedConfig.width}px`,
        height: `${mergedConfig.height}px`,
      }}
    >
      <Suspense fallback={<GraphLoadingSpinner message="Loading layered universe..." />}>
        <LayerVisualization
          nodes={displayNodes}
          edges={displayEdges}
          containerRef={containerRef}
        />
      </Suspense>
    </div>
  );
};

// Export LayerVisualization for advanced usage
export { LayerVisualization } from './LayerVisualization';
export type { LayerVisualizationProps } from './LayerVisualization';

export default LayeredUniverseView;
