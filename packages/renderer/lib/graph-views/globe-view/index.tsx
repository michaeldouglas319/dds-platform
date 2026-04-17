'use client';

import React, { Suspense, useRef } from 'react';
import type { GraphNode, GraphEdge } from '../../graph-utils/types';
import { GraphLoadingSpinner } from '../../components/graph-loading-spinner';
import { GlobeCanvas } from './GlobeCanvas';
import styles from './globe-view.module.css';

/**
 * Props for GlobeView component
 */
export interface GlobeViewProps {
  /** Array of graph nodes to display */
  nodes: GraphNode[];
  /** Array of edges to display */
  edges: GraphEdge[];
  /** Optional CSS class for container */
  className?: string;
}

/**
 * GlobeView - 3D globe visualization for knowledge graph
 *
 * Component structure for rendering graph nodes on an interactive 3D globe.
 * Provides container setup, canvas management, and suspense boundaries for
 * lazy-loaded 3D rendering.
 *
 * @example
 * ```tsx
 * <GlobeView
 *   nodes={nodes}
 *   edges={edges}
 *   className="my-globe"
 * />
 * ```
 */
export const GlobeView: React.FC<GlobeViewProps> = ({
  nodes,
  edges,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`.trim()}
    >
      <Suspense fallback={<GraphLoadingSpinner message="Loading globe..." />}>
        <GlobeCanvas nodes={nodes} edges={edges} containerRef={containerRef} />
      </Suspense>
    </div>
  );
};

export default GlobeView;
