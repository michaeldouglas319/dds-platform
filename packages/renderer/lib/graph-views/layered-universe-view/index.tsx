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
 * Organization of nodes into layers based on type
 */
interface NodeLayer {
  type: string;
  nodes: GraphNode[];
  label: string;
}

/**
 * Calculate node layers from graph nodes
 */
const calculateLayers = (nodes: GraphNode[]): NodeLayer[] => {
  const typeGroups = new Map<string, GraphNode[]>();
  const typeLabels: Record<string, string> = {
    entry: 'Entries',
    signal: 'Signals',
    person: 'People',
    organization: 'Organizations',
    concept: 'Concepts',
    event: 'Events',
  };

  nodes.forEach((node) => {
    if (!typeGroups.has(node.type)) {
      typeGroups.set(node.type, []);
    }
    typeGroups.get(node.type)!.push(node);
  });

  return Array.from(typeGroups.entries()).map(([type, groupNodes]) => ({
    type,
    nodes: groupNodes,
    label: typeLabels[type] || type,
  }));
};

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
  const { selectNode, hoverNode } = useGraphView();
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

  // Calculate layers
  const layers = useMemo(() => calculateLayers(displayNodes), [displayNodes]);

  // Handle node click
  const handleNodeClick = useCallback(
    (nodeId: string, nodeType: GraphNode['type']) => {
      selectNode(nodeId, nodeType);
    },
    [selectNode]
  );

  // Handle node hover
  const handleNodeHover = useCallback(
    (nodeId: string | undefined) => {
      hoverNode(nodeId);
    },
    [hoverNode]
  );

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
        <div className={styles.canvas}>
          {layers.map((layer, layerIndex) => (
            <div
              key={layer.type}
              className={styles.layer}
              data-layer-type={layer.type}
              style={{
                top: `${layerIndex * mergedConfig.layerGap}px`,
              }}
            >
              {mergedConfig.showLayerLabels && (
                <div className={styles.layerLabel}>{layer.label}</div>
              )}

              <div className={styles.nodeRow}>
                {layer.nodes.map((node, nodeIndex) => (
                  <div
                    key={node.id}
                    className={styles.node}
                    data-node-type={node.type}
                    style={{
                      left: `${nodeIndex * mergedConfig.nodeSpacing}px`,
                      width: `${mergedConfig.nodeSize}px`,
                      height: `${mergedConfig.nodeSize}px`,
                    }}
                    onClick={() => handleNodeClick(node.id, node.type)}
                    onMouseEnter={() => handleNodeHover(node.id)}
                    onMouseLeave={() => handleNodeHover(undefined)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.label} (${node.type})`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNodeClick(node.id, node.type);
                      }
                    }}
                  >
                    <div className={styles.nodeContent} />

                    {mergedConfig.showLabels && (
                      <div className={styles.nodeLabel}>{node.label}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Suspense>
    </div>
  );
};

export default LayeredUniverseView;
