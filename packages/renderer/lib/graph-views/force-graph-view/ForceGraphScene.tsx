'use client';

/**
 * 3D Force-Directed Graph Scene Component
 *
 * Renders nodes as 3D spheres and edges as lines in Three.js.
 * Handles click/hover interactions, tooltips, and camera controls.
 *
 * @module @dds/renderer/lib/graph-views/force-graph-view/ForceGraphScene
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { GraphNode, GraphEdge } from '../../graph-utils/types';
import { useGraphView, useIsNodeSelected, useIsNodeHovered } from '../../graph-utils/context';
import styles from './force-graph-view.module.css';

// Type-to-color mapping
const TYPE_COLORS: Record<string, string> = {
  entry: '#4f46e5',       // indigo
  signal: '#dc2626',      // red
  person: '#059669',      // green
  organization: '#7c3aed', // purple
  concept: '#2563eb',     // blue
  event: '#ea580c',       // orange
};

interface ForceGraphSceneProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (nodeId: string, nodeType: GraphNode['type']) => void;
  onNodeHover?: (nodeId: string | undefined) => void;
  width: number;
  height: number;
  showLabels?: boolean;
  nodeScale?: number;
}

/**
 * ForceGraphScene - 3D canvas-based graph visualization
 *
 * Renders nodes and edges using 2D Canvas or SVG with custom rendering.
 * Uses position data from useForceSimulation hook.
 * Handles camera controls and interaction.
 *
 * Note: This is a canvas-based implementation. For full Three.js integration
 * with more advanced features, consider upgrading to use 3d-force-graph library.
 */
export const ForceGraphScene: React.FC<ForceGraphSceneProps> = ({
  nodes,
  edges,
  onNodeClick,
  onNodeHover,
  width,
  height,
  showLabels = true,
  nodeScale = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | undefined>();
  const [cameraZoom, setCameraZoom] = useState(1);
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0 });

  // Calculate node sizes and colors
  const nodeStyles = useMemo(() => {
    const map = new Map<string, { color: string; size: number }>();

    nodes.forEach((node) => {
      const color = node.metadata?.color || TYPE_COLORS[node.type] || '#888888';
      const baseSize = node.metadata?.size || 15;
      const connectedCount = edges.filter((e) => e.source === node.id || e.target === node.id).length;
      const size = baseSize + Math.sqrt(connectedCount) * 3;

      map.set(node.id, { color, size });
    });

    return map;
  }, [nodes, edges]);

  // Create adjacency map for quick lookup
  const adjacencyMap = useMemo(() => {
    const map = new Map<string, Set<string>>();

    edges.forEach((edge) => {
      if (!map.has(edge.source)) map.set(edge.source, new Set());
      if (!map.has(edge.target)) map.set(edge.target, new Set());
      map.get(edge.source)!.add(edge.target);
      map.get(edge.target)!.add(edge.source);
    });

    return map;
  }, [edges]);

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Convert canvas coordinates to world space
      const worldX = (x - width / 2) / cameraZoom + cameraPos.x;
      const worldY = (y - height / 2) / cameraZoom + cameraPos.y;

      // Check if click is on a node
      for (const node of nodes) {
        if (!node.position) continue;

        const dx = node.position.x - worldX;
        const dy = node.position.y - worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const nodeStyle = nodeStyles.get(node.id);
        const nodeRadius = (nodeStyle?.size || 15) * nodeScale;

        if (distance < nodeRadius) {
          onNodeClick?.(node.id, node.type);
          break;
        }
      }
    },
    [nodes, width, height, cameraZoom, cameraPos, nodeScale, nodeStyles, onNodeClick]
  );

  // Handle canvas mouse move for hover
  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Convert canvas coordinates to world space
      const worldX = (x - width / 2) / cameraZoom + cameraPos.x;
      const worldY = (y - height / 2) / cameraZoom + cameraPos.y;

      let hoveredNode: string | undefined;

      // Check if mouse is over a node
      for (const node of nodes) {
        if (!node.position) continue;

        const dx = node.position.x - worldX;
        const dy = node.position.y - worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const nodeStyle = nodeStyles.get(node.id);
        const nodeRadius = (nodeStyle?.size || 15) * nodeScale;

        if (distance < nodeRadius) {
          hoveredNode = node.id;
          break;
        }
      }

      setHoveredNodeId(hoveredNode);
      onNodeHover?.(hoveredNode);
    },
    [nodes, width, height, cameraZoom, cameraPos, nodeScale, nodeStyles, onNodeHover]
  );

  // Handle mouse leave
  const handleCanvasMouseLeave = useCallback(() => {
    setHoveredNodeId(undefined);
    onNodeHover?.(undefined);
  }, [onNodeHover]);

  // Handle wheel zoom
  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const zoomSpeed = 0.1;
    const delta = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
    setCameraZoom((prevZoom) => Math.max(0.1, Math.min(10, prevZoom * delta)));
  }, []);

  // Render the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw edges first (so they're behind nodes)
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1 / cameraZoom;

    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (!sourceNode?.position || !targetNode?.position) return;

      const x1 = (sourceNode.position.x - cameraPos.x) * cameraZoom + width / 2;
      const y1 = (sourceNode.position.y - cameraPos.y) * cameraZoom + height / 2;
      const x2 = (targetNode.position.x - cameraPos.x) * cameraZoom + width / 2;
      const y2 = (targetNode.position.y - cameraPos.y) * cameraZoom + height / 2;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((node) => {
      if (!node.position) return;

      const nodeStyle = nodeStyles.get(node.id);
      const radius = ((nodeStyle?.size || 15) * nodeScale) / cameraZoom;

      const x = (node.position.x - cameraPos.x) * cameraZoom + width / 2;
      const y = (node.position.y - cameraPos.y) * cameraZoom + height / 2;

      // Draw node circle
      ctx.fillStyle = nodeStyle?.color || '#888888';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw selection/hover outline
      if (hoveredNodeId === node.id) {
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 3 / cameraZoom;
        ctx.beginPath();
        ctx.arc(x, y, radius + 4 / cameraZoom, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw label if enabled
      if (showLabels && node.label) {
        ctx.fillStyle = '#000000';
        ctx.font = `${Math.max(10, 12 / cameraZoom)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label.substring(0, 20), x, y + radius + 15 / cameraZoom);
      }
    });
  }, [nodes, edges, width, height, cameraZoom, cameraPos, nodeScale, nodeStyles, hoveredNodeId, showLabels]);

  return (
    <div ref={containerRef} className={styles.sceneContainer}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.canvas}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        onWheel={handleWheel}
      />
      {hoveredNodeId && (
        <div className={styles.tooltip}>
          {nodes.find((n) => n.id === hoveredNodeId)?.label}
        </div>
      )}
    </div>
  );
};

export default ForceGraphScene;
