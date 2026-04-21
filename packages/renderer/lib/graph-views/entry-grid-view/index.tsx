'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import type { GraphNode, GraphEdge } from '../../graph-utils/types';
import { useGraphView } from '../../graph-utils/context';
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
  /** Enable virtualization for large grids (default: true for 100+ nodes) */
  enableVirtualization?: boolean;
  /** Number of items visible in viewport (default: 12) */
  visibleItemCount?: number;
  /** Item height in px (default: 320) */
  itemHeight?: number;
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
 * VirtualizedGridContainer - Renders only visible cards to optimize performance
 */
const VirtualizedGridContainer: React.FC<{
  nodes: GraphNode[];
  edges: GraphEdge[];
  config: Required<EntryGridViewConfig>;
  gridStyles: { container: React.CSSProperties };
  className: string;
  degreeCentrality: Map<string, number>;
  selectedNodeIds: Set<string>;
  hoveredNodeId: string | undefined;
  onCardClick: (nodeId: string, nodeType: GraphNode['type']) => void;
  onCardHover: (nodeId: string | undefined) => void;
}> = ({
  nodes,
  edges,
  config,
  gridStyles,
  className,
  degreeCentrality,
  selectedNodeIds,
  hoveredNodeId,
  onCardClick,
  onCardHover,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: Math.min(config.visibleItemCount, nodes.length) });

  // Handle scroll optimization with requestAnimationFrame
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const visibleHeight = container.clientHeight;

    // Calculate which items should be visible
    const itemHeight = config.itemHeight;
    const columns = config.columns;
    const itemsPerRow = Math.max(1, columns);

    // Account for padding/gap
    const effectiveItemHeight = itemHeight + config.spacing;

    const startIndex = Math.max(0, Math.floor(scrollTop / effectiveItemHeight) * itemsPerRow);
    const endIndex = Math.min(
      nodes.length,
      Math.ceil((scrollTop + visibleHeight) / effectiveItemHeight) * itemsPerRow + itemsPerRow
    );

    setVisibleRange({ start: startIndex, end: endIndex });
  }, [nodes.length, config.itemHeight, config.spacing, config.columns, config.visibleItemCount]);

  // Debounce scroll handler with requestAnimationFrame
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number;
    const scrollListener = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    container.addEventListener('scroll', scrollListener);
    return () => {
      container.removeEventListener('scroll', scrollListener);
      cancelAnimationFrame(rafId);
    };
  }, [handleScroll]);

  const visibleNodes = useMemo(() => {
    return nodes.slice(visibleRange.start, visibleRange.end);
  }, [nodes, visibleRange]);

  const offsetPixels = useMemo(() => {
    const effectiveItemHeight = config.itemHeight + config.spacing;
    const columns = Math.max(1, config.columns);
    const rowIndex = Math.floor(visibleRange.start / columns);
    return rowIndex * effectiveItemHeight;
  }, [visibleRange.start, config.itemHeight, config.spacing, config.columns]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={{
        ...gridStyles.container,
        overflowY: 'auto',
        maxHeight: '100vh',
      } as React.CSSProperties}
    >
      <div
        style={{
          height: `${Math.ceil(nodes.length / Math.max(1, config.columns)) * (config.itemHeight + config.spacing)}px`,
          position: 'relative',
        }}
      >
        <div
          style={{
            transform: `translateY(${offsetPixels}px)`,
            display: 'grid',
            gridTemplateColumns: gridStyles.container.gridTemplateColumns,
            gap: `${config.spacing}px`,
          } as React.CSSProperties}
        >
          {visibleNodes.map((node) => {
            const isSelected = selectedNodeIds.has(node.id);
            const isHovered = hoveredNodeId === node.id;

            return (
              <GridCard
                key={node.id}
                node={node}
                isSelected={isSelected}
                isHovered={isHovered}
                edgeCount={degreeCentrality.get(node.id) || 0}
                onSelect={() => onCardClick(node.id, node.type)}
                onHover={() => onCardHover(node.id)}
                onHoverEnd={() => onCardHover(undefined)}
                config={config}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * EntryGridView - Responsive grid layout for knowledge graph entries
 *
 * Displays graph nodes as filterable, clickable cards in a responsive grid.
 * Uses CSS Grid for layout, shows node titles, descriptions, tags, and images.
 * Supports selection/hover interactions via GraphView context.
 *
 * For 100+ nodes, automatically enables virtualization to maintain 60fps.
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
  const { selectNode, hoverNode, state } = useGraphView();

  // Merge default config with provided config
  const mergedConfig: Required<EntryGridViewConfig> = useMemo(
    () => ({
      columns: config.columns ?? 3,
      spacing: config.spacing ?? 16,
      showEdgeCount: config.showEdgeCount ?? true,
      showTypeIndicator: config.showTypeIndicator ?? true,
      descriptionLines: config.descriptionLines ?? 3,
      enableVirtualization: config.enableVirtualization ?? nodes.length >= 100,
      visibleItemCount: config.visibleItemCount ?? 12,
      itemHeight: config.itemHeight ?? 320,
    }),
    [config, nodes.length]
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

  // Memoize selected node IDs for faster lookup
  const selectedNodeIds = useMemo(() => {
    return new Set(state.selectedNodes.map(n => n.nodeId));
  }, [state.selectedNodes]);

  // Handle card click
  const handleCardClick = useCallback((nodeId: string, nodeType: GraphNode['type']) => {
    selectNode(nodeId, nodeType);
  }, [selectNode]);

  // Handle card hover
  const handleCardHover = useCallback((nodeId: string | undefined) => {
    hoverNode(nodeId);
  }, [hoverNode]);

  if (nodes.length === 0) {
    return (
      <div className={`${styles.emptyState} ${className}`}>
        <p>No entries to display</p>
      </div>
    );
  }

  // Use virtualization for large datasets
  if (mergedConfig.enableVirtualization && nodes.length >= 100) {
    return (
      <VirtualizedGridContainer
        nodes={nodes}
        edges={edges}
        config={mergedConfig}
        gridStyles={gridStyles}
        className={className}
        degreeCentrality={degreeCentrality}
        selectedNodeIds={selectedNodeIds}
        hoveredNodeId={state.hoveredNodeId}
        onCardClick={handleCardClick}
        onCardHover={handleCardHover}
      />
    );
  }

  // Non-virtualized for smaller datasets
  return (
    <div className={`${styles.container} ${className}`} style={gridStyles.container as React.CSSProperties}>
      {nodes.map((node) => {
        const isSelected = selectedNodeIds.has(node.id);
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
