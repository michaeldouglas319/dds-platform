/**
 * Viewport & Camera Calculation Utilities
 *
 * Pure functions for calculating camera position, zoom, and viewport transformations.
 * Used by all graph views to manage spatial transformations and view framing.
 *
 * @module @dds/renderer/lib/graph-utils/viewport
 */

import type { GraphNode, GraphViewport, GraphData } from './types';

// ─── Types ────────────────────────────────────────────────────────

/**
 * Configuration for viewport calculations.
 * Includes aspect ratio, padding, and view-specific settings.
 */
export interface ViewportConfig {
  /** Canvas/viewport width in pixels */
  width: number;
  /** Canvas/viewport height in pixels */
  height: number;
  /** Aspect ratio (width / height) */
  aspectRatio: number;
  /** Default zoom level */
  defaultZoom: number;
  /** Padding around nodes (in graph units) */
  padding: number;
  /** Min/max zoom bounds */
  minZoom: number;
  maxZoom: number;
}

/**
 * Camera configuration for a specific view type.
 * Includes position, rotation, and FOV settings.
 */
export interface CameraConfig {
  /** Position in 3D space */
  position: { x: number; y: number; z: number };
  /** Rotation angles (radians) */
  rotation: { x: number; y: number; z: number };
  /** Field of view for perspective camera (degrees) */
  fov: number;
  /** Near clipping plane */
  near: number;
  /** Far clipping plane */
  far: number;
}

// ─── Default Viewport Config ──────────────────────────────────────

/**
 * Create a default viewport configuration for a given canvas size.
 */
export function createViewportConfig(
  width: number,
  height: number,
  options?: Partial<ViewportConfig>
): ViewportConfig {
  return {
    width,
    height,
    aspectRatio: width / height,
    defaultZoom: 1,
    padding: 50,
    minZoom: 0.1,
    maxZoom: 10,
    ...options,
  };
}

// ─── Camera Position Calculations ─────────────────────────────────

/**
 * Calculate camera position for force-directed graph view (standard 2D/3D).
 * Camera positioned above/behind the graph looking down/forward.
 */
export function calculateForcedirectedCamera(
  graphData: GraphData,
  config: ViewportConfig
): CameraConfig {
  // Calculate bounds from node positions
  const bounds = calculateGraphBounds(graphData.nodes);

  // Default distance from graph (Z position)
  const distance = Math.max(bounds.width, bounds.height) * 0.75;

  return {
    position: {
      x: bounds.centerX,
      y: bounds.centerY,
      z: distance,
    },
    rotation: {
      x: -Math.PI / 6, // 30 degrees down
      y: 0,
      z: 0,
    },
    fov: 75,
    near: 0.1,
    far: 10000,
  };
}

/**
 * Calculate camera position for layered-universe view.
 * Camera positioned above looking straight down, viewing layers (Z-axis).
 */
export function calculateLayeredUniverseCamera(
  graphData: GraphData,
  config: ViewportConfig
): CameraConfig {
  const bounds = calculateGraphBounds(graphData.nodes);

  // For layered view, Z distance is much greater to see all layers
  const maxZ = Math.max(...graphData.nodes.map(n => n.position?.z ?? 0)) || 100;
  const distance = Math.max(bounds.width, bounds.height, maxZ) * 0.8;

  return {
    position: {
      x: bounds.centerX,
      y: bounds.centerY,
      z: distance,
    },
    rotation: {
      x: -Math.PI / 2.2, // Nearly straight down
      y: 0,
      z: 0,
    },
    fov: 60,
    near: 0.1,
    far: 10000,
  };
}

/**
 * Calculate camera position for globe view.
 * Camera positioned at distance for full-sphere view.
 */
export function calculateGlobeCamera(
  graphData: GraphData,
  config: ViewportConfig
): CameraConfig {
  // Globe assumes sphere radius ~100 units
  const radius = 100;
  const distance = radius * 2.5;

  return {
    position: {
      x: 0,
      y: 0,
      z: distance,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
    fov: 50,
    near: 0.1,
    far: 10000,
  };
}

/**
 * Calculate camera position for entry-grid view (orthographic 2D grid).
 * Camera positioned straight above, looking down at grid.
 */
export function calculateGridCamera(
  graphData: GraphData,
  config: ViewportConfig
): CameraConfig {
  const bounds = calculateGraphBounds(graphData.nodes);
  const distance = Math.max(bounds.width, bounds.height) * 0.5;

  return {
    position: {
      x: bounds.centerX,
      y: bounds.centerY,
      z: distance,
    },
    rotation: {
      x: -Math.PI / 2, // Straight down
      y: 0,
      z: 0,
    },
    fov: 75,
    near: 0.1,
    far: 10000,
  };
}

/**
 * Calculate appropriate camera for view type.
 */
export function calculateCameraPosition(
  viewType: 'force-directed' | 'layered-universe' | 'globe' | 'entry-grid',
  graphData: GraphData,
  config: ViewportConfig
): CameraConfig {
  switch (viewType) {
    case 'force-directed':
      return calculateForcedirectedCamera(graphData, config);
    case 'layered-universe':
      return calculateLayeredUniverseCamera(graphData, config);
    case 'globe':
      return calculateGlobeCamera(graphData, config);
    case 'entry-grid':
      return calculateGridCamera(graphData, config);
    default:
      return calculateForcedirectedCamera(graphData, config);
  }
}

// ─── Zoom to Selection ────────────────────────────────────────────

/**
 * Calculate viewport to frame a single node with padding.
 * Returns viewport state that centers and zooms to the node.
 */
export function zoomToNode(
  node: GraphNode,
  padding: number = 50,
  config?: ViewportConfig
): Partial<GraphViewport> {
  if (!node.position) {
    return {
      centerX: 0,
      centerY: 0,
      zoom: 1,
    };
  }

  // For a single node, zoom in close but leave padding
  const nodeSize = node.metadata?.size ?? 10;
  const zoomLevel = config ? Math.min(config.maxZoom, 3) : 2;

  return {
    centerX: node.position.x,
    centerY: node.position.y,
    centerZ: node.position.z,
    zoom: zoomLevel,
  };
}

/**
 * Calculate viewport to frame multiple nodes with padding.
 * Returns viewport state that centers and zooms to encompass all nodes.
 */
export function zoomToSelection(
  nodes: GraphNode[],
  padding: number = 50,
  config?: ViewportConfig
): Partial<GraphViewport> {
  if (nodes.length === 0) {
    return {
      centerX: 0,
      centerY: 0,
      zoom: 1,
    };
  }

  if (nodes.length === 1) {
    return zoomToNode(nodes[0], padding, config);
  }

  const bounds = calculateGraphBounds(nodes);

  // Calculate zoom to fit all nodes with padding
  const width = bounds.width + padding * 2;
  const height = bounds.height + padding * 2;

  let zoom = 1;
  if (config) {
    const maxDim = Math.max(width, height);
    const viewportMaxDim = Math.max(config.width, config.height);
    zoom = Math.max(
      config.minZoom,
      Math.min(config.maxZoom, viewportMaxDim / maxDim)
    );
  }

  return {
    centerX: bounds.centerX,
    centerY: bounds.centerY,
    centerZ: bounds.centerZ,
    zoom,
  };
}

/**
 * Reset viewport to default state (center, default zoom, no rotation).
 */
export function resetViewport(
  config?: ViewportConfig
): GraphViewport {
  return {
    centerX: 0,
    centerY: 0,
    centerZ: 0,
    zoom: config?.defaultZoom ?? 1,
    rotation: { x: 0, y: 0, z: 0 },
    fov: 75,
    near: 0.1,
    far: 10000,
  };
}

// ─── Helper Functions ─────────────────────────────────────────────

/**
 * Calculate bounding box for a set of nodes.
 */
export interface GraphBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  centerX: number;
  centerY: number;
  centerZ: number;
  width: number;
  height: number;
  depth: number;
}

export function calculateGraphBounds(nodes: GraphNode[]): GraphBounds {
  if (nodes.length === 0) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      minZ: 0,
      maxZ: 0,
      centerX: 0,
      centerY: 0,
      centerZ: 0,
      width: 0,
      height: 0,
      depth: 0,
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const node of nodes) {
    if (!node.position) continue;

    minX = Math.min(minX, node.position.x);
    maxX = Math.max(maxX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxY = Math.max(maxY, node.position.y);
    minZ = Math.min(minZ, node.position.z ?? 0);
    maxZ = Math.max(maxZ, node.position.z ?? 0);
  }

  // Handle case where all nodes are at same position
  if (!isFinite(minX) || minX === maxX) minX = 0;
  if (!isFinite(maxX) || maxX === minX) maxX = 100;
  if (!isFinite(minY) || minY === maxY) minY = 0;
  if (!isFinite(maxY) || maxY === minY) maxY = 100;
  if (!isFinite(minZ)) minZ = 0;
  if (!isFinite(maxZ) || maxZ === minZ) maxZ = 100;

  return {
    minX,
    maxX,
    minY,
    maxY,
    minZ,
    maxZ,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    centerZ: (minZ + maxZ) / 2,
    width: maxX - minX,
    height: maxY - minY,
    depth: maxZ - minZ,
  };
}

/**
 * Clamp zoom level to valid range.
 */
export function clampZoom(zoom: number, min: number = 0.1, max: number = 10): number {
  return Math.max(min, Math.min(max, zoom));
}

/**
 * Interpolate between two viewports (for smooth transitions).
 */
export function lerpViewport(
  from: GraphViewport,
  to: GraphViewport,
  t: number // 0 to 1
): GraphViewport {
  const clampedT = Math.max(0, Math.min(1, t));

  return {
    centerX: from.centerX + (to.centerX - from.centerX) * clampedT,
    centerY: from.centerY + (to.centerY - from.centerY) * clampedT,
    centerZ: (from.centerZ ?? 0) + ((to.centerZ ?? 0) - (from.centerZ ?? 0)) * clampedT,
    zoom: from.zoom + (to.zoom - from.zoom) * clampedT,
    rotation: from.rotation
      ? {
          x: (from.rotation.x ?? 0) + ((to.rotation?.x ?? 0) - (from.rotation.x ?? 0)) * clampedT,
          y: (from.rotation.y ?? 0) + ((to.rotation?.y ?? 0) - (from.rotation.y ?? 0)) * clampedT,
          z: (from.rotation.z ?? 0) + ((to.rotation?.z ?? 0) - (from.rotation.z ?? 0)) * clampedT,
        }
      : undefined,
    fov: from.fov
      ? from.fov + ((to.fov ?? from.fov) - from.fov) * clampedT
      : to.fov,
  };
}
