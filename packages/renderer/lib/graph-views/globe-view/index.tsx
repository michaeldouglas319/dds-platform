'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Suspense } from 'react';
import { InteractiveGlobeScene } from '@dds/globe/components/InteractiveGlobeScene';
import type { GlobePoint } from '@dds/globe/types';
import type { GraphNode, GraphEdge } from '../../graph-utils/types';
import { useGraphView, useIsNodeSelected, useIsNodeHovered } from '../../graph-utils/context';
import { categoryColorMap } from '@dds/globe/category-colors';
import styles from './globe-view.module.css';

/**
 * Configuration for GlobeView
 */
export interface GlobeViewConfig {
  /** Radius of the globe (default: 3) */
  radius?: number;
  /** Rotation speed (default: 0.69) */
  rotationSpeed?: number;
  /** Point base size (default: 0.05) */
  pointBaseSize?: number;
  /** Point weight scale (default: 0) */
  pointWeightScale?: number;
  /** Show arcs between connected points (default: true) */
  showArcs?: boolean;
  /** Show halos around points (default: true) */
  showHalos?: boolean;
  /** Camera position (default: [0, 0, 12]) */
  cameraPosition?: [number, number, number];
  /** Camera FOV (default: 32) */
  cameraFov?: number;
  /** Show labels on hover (default: true) */
  showLabels?: boolean;
  /** Background color (default: null for transparent) */
  background?: string | null;
}

/**
 * Props for GlobeView component
 */
export interface GlobeViewProps {
  /** Array of graph nodes to display as points */
  nodes: GraphNode[];
  /** Array of edges for arc rendering */
  edges: GraphEdge[];
  /** Configuration options */
  config?: GlobeViewConfig;
  /** Optional CSS class for container */
  className?: string;
}

/**
 * Converts a GraphNode to a GlobePoint
 */
function nodeToGlobePoint(node: GraphNode, radius: number): GlobePoint {
  // Use node position if available, otherwise derive from id hash
  let lat = 0;
  let lon = 0;

  if (node.position?.x !== undefined && node.position?.y !== undefined) {
    // Map normalized position [-1, 1] to lat/lon
    lat = (node.position.y || 0) * 90;
    lon = (node.position.x || 0) * 180;
  } else {
    // Use hash of node id for pseudo-random distribution
    const hash = node.id
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    lat = (((hash * 37) % 180) - 90);
    lon = (((hash * 73) % 360) - 180);
  }

  // Clamp to valid ranges
  lat = Math.max(-90, Math.min(90, lat));
  lon = Math.max(-180, Math.min(180, lon));

  // Determine color from node metadata or type
  let color = node.metadata?.color;
  if (!color && node.tags?.[0]) {
    color = categoryColorMap[node.tags[0] as keyof typeof categoryColorMap];
  }
  if (!color) {
    color = categoryColorMap['default'];
  }

  // Size based on node metadata or default
  const weight = node.metadata?.size ?? 1;

  return {
    id: node.id,
    lat,
    lon,
    weight,
    name: node.label,
    color,
    tag: node.tags?.[0],
    date: node.metadata?.published_at,
  };
}

/**
 * GlobeView - 3D globe visualization for knowledge graph nodes
 *
 * Renders graph nodes as points on an interactive 3D globe.
 * Supports selection/hover interactions, arc visualization for edges,
 * and synchronization with graph context.
 *
 * @example
 * ```tsx
 * <GlobeView
 *   nodes={visibleNodes}
 *   edges={edges}
 *   config={{ radius: 3, showArcs: true }}
 * />
 * ```
 */
export const GlobeView: React.FC<GlobeViewProps> = ({
  nodes,
  edges,
  config = {},
  className = '',
}) => {
  const { selectNode, hoverNode, updateViewport } = useGraphView();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Merge default config with provided config
  const mergedConfig = useMemo<Required<GlobeViewConfig>>(
    () => ({
      radius: config.radius ?? 3,
      rotationSpeed: config.rotationSpeed ?? 0.69,
      pointBaseSize: config.pointBaseSize ?? 0.05,
      pointWeightScale: config.pointWeightScale ?? 0,
      showArcs: config.showArcs ?? true,
      showHalos: config.showHalos ?? true,
      cameraPosition: config.cameraPosition ?? [0, 0, 12],
      cameraFov: config.cameraFov ?? 32,
      showLabels: config.showLabels ?? true,
      background: config.background ?? null,
    }),
    [config]
  );

  // Convert nodes to globe points
  const globePoints = useMemo(() => {
    return nodes.map((node) => nodeToGlobePoint(node, mergedConfig.radius));
  }, [nodes, mergedConfig.radius]);

  // Filter arcs to only include edges between visible nodes
  const visibleNodeIds = useMemo(() => {
    return new Set(nodes.map((n) => n.id));
  }, [nodes]);

  const filteredEdges = useMemo(() => {
    return edges.filter(
      (edge) =>
        visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [edges, visibleNodeIds]);

  // Create node lookup for quick access
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    nodes.forEach((node) => {
      map.set(node.id, node);
    });
    return map;
  }, [nodes]);

  // Handle point selection
  const handlePointSelect = useCallback(
    (index: number, point: GlobePoint) => {
      if (!point.id) return;

      const node = nodeMap.get(point.id);
      if (node) {
        selectNode(point.id, node.type);
        setFocusedIndex(index);

        // Update viewport based on camera position
        updateViewport({
          centerX: 0,
          centerY: 0,
          centerZ: 0,
          zoom: 1,
          rotation: { x: 0, y: 0, z: 0 },
          fov: mergedConfig.cameraFov,
        });
      }
    },
    [nodeMap, selectNode, updateViewport, mergedConfig.cameraFov]
  );

  // Handle point hover
  const handlePointEnter = useCallback(
    (index: number, point: GlobePoint) => {
      if (point.id) {
        hoverNode(point.id);
      }
    },
    [hoverNode]
  );

  // Handle point unhover
  const handlePointLeave = useCallback(
    (index: number, point: GlobePoint) => {
      hoverNode(undefined);
    },
    [hoverNode]
  );

  // Custom tooltip renderer
  const renderTooltip = useCallback((point: GlobePoint) => {
    if (!point.id) return null;

    const node = nodeMap.get(point.id);
    if (!node) return null;

    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipLabel}>{node.label}</div>
        {node.type && (
          <div className={styles.tooltipType}>{node.type}</div>
        )}
        {node.tags && node.tags.length > 0 && (
          <div className={styles.tooltipTags}>
            {node.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        {node.description && (
          <div className={styles.tooltipDescription}>
            {node.description.substring(0, 100)}
            {node.description.length > 100 ? '...' : ''}
          </div>
        )}
      </div>
    );
  }, [nodeMap]);

  if (nodes.length === 0) {
    return (
      <div className={`${styles.emptyState} ${className}`}>
        <p>No nodes to display on globe</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <Suspense fallback={<div className={styles.loading}>Loading globe...</div>}>
        <InteractiveGlobeScene
          events={globePoints}
          focusedIndex={focusedIndex}
          onPointSelect={handlePointSelect}
          onPointEnter={handlePointEnter}
          onPointLeave={handlePointLeave}
          debug={{
            pointBaseSize: mergedConfig.pointBaseSize,
            pointWeightScale: mergedConfig.pointWeightScale,
            globeRotationSpeed: mergedConfig.rotationSpeed,
          }}
          showArcs={mergedConfig.showArcs}
          showHalos={mergedConfig.showHalos}
          useCategoryColors={true}
          background={mergedConfig.background}
          radius={mergedConfig.radius}
          cameraPosition={mergedConfig.cameraPosition}
          cameraFov={mergedConfig.cameraFov}
          renderTooltip={renderTooltip}
          style={{ borderRadius: '0.5rem' }}
        />
      </Suspense>
    </div>
  );
};

export default GlobeView;
