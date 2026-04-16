'use client';

/**
 * Force-Directed Graph View Component
 *
 * Interactive 3D force-directed graph visualization where nodes repel each other
 * and edges pull connected nodes together. Uses physics-based simulation for
 * natural-looking layouts.
 *
 * @module @dds/renderer/lib/graph-views/force-graph-view
 */

import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import type { GraphNode, GraphEdge } from '../../graph-utils/types';
import { useGraphView, useGraphViewFilter } from '../../graph-utils/context';
import { calculateDegreeCentrality } from '../../graph-utils/selection';
import { useForceSimulation, type ForceSimulationConfig } from './useForceSimulation';
import { ForceGraphScene } from './ForceGraphScene';
import styles from './force-graph-view.module.css';

/**
 * Configuration for ForceDirectedGraphView
 */
export interface ForceDirectedGraphViewConfig extends ForceSimulationConfig {
  /** Show node labels (default: true) */
  showLabels?: boolean;
  /** Show edges/connections (default: true) */
  showEdges?: boolean;
  /** Node size scale factor (default: 1) */
  nodeScale?: number;
  /** Canvas width in pixels (default: 800) */
  width?: number;
  /** Canvas height in pixels (default: 600) */
  height?: number;
  /** Auto-pause simulation when settled (default: true) */
  autoPause?: boolean;
  /** Show controls UI (default: true) */
  showControls?: boolean;
}

/**
 * Props for ForceDirectedGraphView component
 */
export interface ForceDirectedGraphViewProps {
  /** Array of graph nodes to display */
  nodes: GraphNode[];
  /** Array of edges for force connections */
  edges: GraphEdge[];
  /** Configuration options */
  config?: ForceDirectedGraphViewConfig;
  /** Optional CSS class for container */
  className?: string;
}

/**
 * ForceDirectedGraphView - Interactive force-directed graph visualization
 *
 * Displays graph nodes as 3D spheres with physics-based simulation.
 * Nodes repel each other (Coulomb force) and edges attract connected nodes (Hooke's law).
 * Supports selection, hover highlighting, filtering, and interactive camera controls.
 *
 * Features:
 * - Physics-based layout (force-directed)
 * - Node size scales with connectivity
 * - Type-based coloring
 * - Hover to highlight connected nodes
 * - Click to select nodes
 * - Scroll to zoom
 * - Pause/resume simulation
 * - Responds to filter changes
 *
 * @example
 * ```tsx
 * <ForceDirectedGraphView
 *   nodes={visibleNodes}
 *   edges={edges}
 *   config={{
 *     nodeStrength: -50,
 *     linkDistance: 100,
 *     chargeStrength: -300,
 *     showLabels: true,
 *     width: 1000,
 *     height: 800,
 *   }}
 * />
 * ```
 */
export const ForceDirectedGraphView: React.FC<ForceDirectedGraphViewProps> = ({
  nodes,
  edges,
  config = {},
  className = '',
}) => {
  const { selectNode, hoverNode, updateViewport } = useGraphView();
  const { filteredData } = useGraphViewFilter();

  // Merge with defaults
  const mergedConfig: Required<ForceDirectedGraphViewConfig> = useMemo(
    () => ({
      nodeStrength: config.nodeStrength ?? -50,
      linkDistance: config.linkDistance ?? 100,
      chargeStrength: config.chargeStrength ?? -300,
      theta: config.theta ?? 0.9,
      damping: config.damping ?? 0.6,
      timeStep: config.timeStep ?? 0.02,
      minVelocity: config.minVelocity ?? 0.01,
      showLabels: config.showLabels ?? true,
      showEdges: config.showEdges ?? true,
      nodeScale: config.nodeScale ?? 1,
      width: config.width ?? 800,
      height: config.height ?? 600,
      autoPause: config.autoPause ?? true,
      showControls: config.showControls ?? true,
    }),
    [config]
  );

  // Use filtered data if available, otherwise use all nodes/edges
  const displayNodes = filteredData.nodes.length > 0 ? filteredData.nodes : nodes;
  const displayEdges = filteredData.edges.length > 0 ? filteredData.edges : edges;

  // Run force simulation
  const {
    nodes: simulatedNodes,
    isSimulating,
    isSettled,
    pause,
    resume,
    reset,
  } = useForceSimulation(displayNodes, displayEdges, {
    nodeStrength: mergedConfig.nodeStrength,
    linkDistance: mergedConfig.linkDistance,
    chargeStrength: mergedConfig.chargeStrength,
    theta: mergedConfig.theta,
    damping: mergedConfig.damping,
    timeStep: mergedConfig.timeStep,
    minVelocity: mergedConfig.minVelocity,
  });

  // Auto-pause when settled
  useEffect(() => {
    if (mergedConfig.autoPause && isSettled && isSimulating) {
      pause();
    }
  }, [isSettled, isSimulating, mergedConfig.autoPause, pause]);

  // Calculate degree centrality for node sizes
  const degreeCentrality = useMemo(() => {
    return calculateDegreeCentrality(displayNodes, displayEdges);
  }, [displayNodes, displayEdges]);

  // Handle node click
  const handleNodeClick = useCallback(
    (nodeId: string, nodeType: GraphNode['type']) => {
      selectNode(nodeId, nodeType);

      // Update viewport to zoom to selected node
      const node = simulatedNodes.find((n) => n.id === nodeId);
      if (node && node.position) {
        updateViewport({
          centerX: node.position.x,
          centerY: node.position.y,
          centerZ: node.position.z,
          zoom: 2,
        });
      }
    },
    [selectNode, simulatedNodes, updateViewport]
  );

  // Handle node hover
  const handleNodeHover = useCallback(
    (nodeId: string | undefined) => {
      hoverNode(nodeId);
    },
    [hoverNode]
  );

  // Toggle simulation
  const toggleSimulation = useCallback(() => {
    if (isSimulating) {
      pause();
    } else {
      resume();
    }
  }, [isSimulating, pause, resume]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        toggleSimulation();
      }
      if (e.code === 'KeyR') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSimulation, reset]);

  if (displayNodes.length === 0) {
    return (
      <div className={`${styles.emptyState} ${className}`}>
        <p>No nodes to display</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <ForceGraphScene
        nodes={simulatedNodes}
        edges={displayEdges}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        width={mergedConfig.width}
        height={mergedConfig.height}
        showLabels={mergedConfig.showLabels}
        nodeScale={mergedConfig.nodeScale}
      />

      {mergedConfig.showControls && (
        <div className={styles.controls}>
          <button
            className={styles.controlButton}
            onClick={toggleSimulation}
            title={isSimulating ? 'Pause simulation (Space)' : 'Resume simulation (Space)'}
          >
            {isSimulating ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button
            className={styles.controlButton}
            onClick={reset}
            title="Reset simulation (R)"
          >
            ↻ Reset
          </button>
          <div className={styles.status}>
            {isSettled ? '✓ Settled' : isSimulating ? '⚙ Simulating...' : '⏸ Paused'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForceDirectedGraphView;
