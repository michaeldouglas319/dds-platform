'use client';

import React, { useMemo } from 'react';
import type { GraphNode, GraphEdge } from '../../graph-utils/types';
import { useGraphView, useIsNodeSelected, useIsNodeHovered } from '../../graph-utils/context';
import { calculateDegreeCentrality } from '../../graph-utils/selection';
import GridCard from './GridCard';
import { useGridLayout } from './useGridLayout';
import styles from './entry-grid-view.module.css';

/**
 * Configuration for EntryGridView
 */
export interface EntryGridViewConfig {
  /** Number of columns (default: 3) */
  columns?: number;
  /** Spacing between cards in px (default: 16) */
  spacing?: number;
  /** Show edge count badge (default: true) */
  showEdgeCount?: boolean;
  /** Show type color indicator (default: true) */
  showTypeIndicator?: boolean;
  /** Truncate description after N lines (default: 3) */
  descriptionLines?: number;
}

/**
 * Props for EntryGridView component
 */
export interface EntryGridViewProps {
  /** Array of graph nodes to display */
  nodes: GraphNode[];
  /** Array of edges for connection counting */
  edges: GraphEdge[];
  /** Configuration options */
  config?: EntryGridViewConfig;
  /** Optional CSS class for container */
  className?: string;
}

/**
 * EntryGridView - Responsive grid layout for knowledge graph entries
 *
 * Displays graph nodes as filterable, clickable cards in a responsive grid.
 * Uses CSS Grid for layout, shows node titles, descriptions, tags, and images.
 * Supports selection/hover interactions via GraphView context.
 *
 * @example
 * ```tsx
 * <EntryGridView
 *   nodes={visibleNodes}
 *   edges={edges}
 *   config={{ columns: 4, spacing: 20 }}
 * />
 * ```
 */
export const EntryGridView: React.FC<EntryGridViewProps> = ({
  nodes,
  edges,
  config = {},
  className = '',
}) => {
  const { selectNode, hoverNode } = useGraphView();

  // Merge default config with provided config
  const mergedConfig: Required<EntryGridViewConfig> = useMemo(
    () => ({
      columns: config.columns ?? 3,
      spacing: config.spacing ?? 16,
      showEdgeCount: config.showEdgeCount ?? true,
      showTypeIndicator: config.showTypeIndicator ?? true,
      descriptionLines: config.descriptionLines ?? 3,
    }),
    [config]
  );

  // Get grid layout styles
  const gridStyles = useGridLayout(mergedConfig.columns, mergedConfig.spacing);

  // Calculate degree centrality for all nodes (for edge count badges)
  const degreeCentrality = useMemo(() => {
    const centrality = new Map<string, number>();
    for (const node of nodes) {
      centrality.set(node.id, calculateDegreeCentrality(node.id, edges));
    }
    return centrality;
  }, [nodes, edges]);

  // Handle card click
  const handleCardClick = (nodeId: string, nodeType: GraphNode['type']) => {
    selectNode(nodeId, nodeType);
  };

  // Handle card hover
  const handleCardHover = (nodeId: string | undefined) => {
    hoverNode(nodeId);
  };

  if (nodes.length === 0) {
    return (
      <div className={`${styles.emptyState} ${className}`}>
        <p>No entries to display</p>
      </div>
    );
  }

  // Extract isSelected and isHovered at component level to use hooks properly
  const { state } = useGraphView();

  return (
    <div className={`${styles.container} ${className}`} style={gridStyles.container as React.CSSProperties}>
      {nodes.map((node) => {
        const isSelected = state.selectedNodes.some((n) => n.nodeId === node.id);
        const isHovered = state.hoveredNodeId === node.id;

        return (
          <GridCard
            key={node.id}
            node={node}
            isSelected={isSelected}
            isHovered={isHovered}
            edgeCount={degreeCentrality.get(node.id) || 0}
            onSelect={() => handleCardClick(node.id, node.type)}
            onHover={() => handleCardHover(node.id)}
            onHoverEnd={() => handleCardHover(undefined)}
            config={mergedConfig}
          />
        );
      })}
    </div>
  );
};

export default EntryGridView;
