/**
 * GlobeScene - Three.js Scene Wrapper with Advanced Interaction
 *
 * Provides a reusable Three.js canvas wrapper with mouse/touch interaction,
 * camera control, and graph node visualization features.
 * This component wraps the InteractiveGlobeScene with additional state management.
 */

'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import type { GraphNode, GraphEdge, GraphViewport } from '../../graph-utils/types';
import { useGlobeInteraction } from './useGlobeInteraction';

export interface GlobeSceneProps {
  /** Array of graph nodes */
  nodes: GraphNode[];
  /** Array of edges */
  edges: GraphEdge[];
  /** Viewport configuration */
  viewport?: GraphViewport;
  /** Called when viewport changes */
  onViewportChange?: (viewport: GraphViewport) => void;
  /** Called when node is selected */
  onNodeSelect?: (nodeId: string) => void;
  /** Called when node is hovered */
  onNodeHover?: (nodeId: string | undefined) => void;
  /** Show arc connections */
  showArcs?: boolean;
  /** Show point halos */
  showHalos?: boolean;
  /** Children to render in the canvas */
  children?: React.ReactNode;
  /** CSS class name */
  className?: string;
}

/**
 * GlobeScene - Three.js scene container with interaction handling
 *
 * Manages camera state, viewport sync, and interaction events.
 * Provides a wrapper around Three.js canvas for graph visualization.
 *
 * @example
 * ```tsx
 * <GlobeScene
 *   nodes={nodes}
 *   edges={edges}
 *   onViewportChange={handleViewportChange}
 *   onNodeSelect={handleNodeSelect}
 * />
 * ```
 */
export const GlobeScene: React.FC<GlobeSceneProps> = ({
  nodes,
  edges,
  viewport,
  onViewportChange,
  onNodeSelect,
  onNodeHover,
  showArcs = true,
  showHalos = true,
  children,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraStateRef = useRef({
    rotationX: 0,
    rotationY: 0,
    zoom: 1,
    fov: 32,
  });

  // Handle rotation events
  const handleRotate = useCallback(
    (deltaX: number, deltaY: number) => {
      cameraStateRef.current.rotationY += deltaX;
      cameraStateRef.current.rotationX += deltaY;

      if (onViewportChange) {
        onViewportChange({
          centerX: 0,
          centerY: 0,
          centerZ: 0,
          zoom: cameraStateRef.current.zoom,
          rotation: {
            x: cameraStateRef.current.rotationX,
            y: cameraStateRef.current.rotationY,
            z: 0,
          },
          fov: cameraStateRef.current.fov,
        });
      }
    },
    [onViewportChange]
  );

  // Handle zoom events
  const handleZoom = useCallback(
    (delta: number) => {
      cameraStateRef.current.zoom += delta * 0.1;
      cameraStateRef.current.zoom = Math.max(
        0.1,
        Math.min(5, cameraStateRef.current.zoom)
      );

      if (onViewportChange) {
        onViewportChange({
          centerX: 0,
          centerY: 0,
          centerZ: 0,
          zoom: cameraStateRef.current.zoom,
          rotation: {
            x: cameraStateRef.current.rotationX,
            y: cameraStateRef.current.rotationY,
            z: 0,
          },
          fov: cameraStateRef.current.fov,
        });
      }
    },
    [onViewportChange]
  );

  // Set up globe interaction
  useGlobeInteraction({
    containerRef,
    onRotate: handleRotate,
    onZoom: handleZoom,
    sensitivity: 0.005,
    zoomSensitivity: 0.15,
  });

  // Initialize camera state from viewport prop
  React.useEffect(() => {
    if (viewport) {
      cameraStateRef.current.zoom = viewport.zoom || 1;
      cameraStateRef.current.rotationX = viewport.rotation?.x || 0;
      cameraStateRef.current.rotationY = viewport.rotation?.y || 0;
      cameraStateRef.current.fov = viewport.fov || 32;
    }
  }, [viewport]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        cursor: 'grab',
      }}
      onMouseEnter={() => {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'grab';
        }
      }}
      onMouseDown={() => {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'grabbing';
        }
      }}
      onMouseUp={() => {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'grab';
        }
      }}
      onMouseLeave={() => {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'default';
        }
      }}
    >
      {children}
    </div>
  );
};

export default GlobeScene;
