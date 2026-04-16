/**
 * Force Simulation State Management Hook
 *
 * Manages the physics simulation state for force-directed graph layout.
 * Handles node positions, velocities, and force calculations using a
 * physics-based algorithm (force-directed graph).
 *
 * @module @dds/renderer/lib/graph-views/force-graph-view/useForceSimulation
 */

import { useEffect, useRef, useState } from 'react';
import type { GraphNode, GraphEdge } from '../../graph-utils/types';

/**
 * Force simulation configuration options
 */
export interface ForceSimulationConfig {
  /** Node repulsion strength (default: -50) */
  nodeStrength?: number;
  /** Edge attraction distance (default: 100) */
  linkDistance?: number;
  /** Charge/repulsion strength (default: -300) */
  chargeStrength?: number;
  /** Theta parameter for Barnes-Hut simulation (default: 0.9) */
  theta?: number;
  /** Friction/damping for velocity (default: 0.6) */
  damping?: number;
  /** Time step for simulation (default: 0.02) */
  timeStep?: number;
  /** Min velocity threshold to stop simulation (default: 0.01) */
  minVelocity?: number;
}

/**
 * Node position with velocity tracking
 */
interface SimulatedNode extends GraphNode {
  vx?: number; // velocity x
  vy?: number; // velocity y
  vz?: number; // velocity z (for 3D)
  fx?: number; // force x
  fy?: number; // force y
  fz?: number; // force z (for 3D)
}

/**
 * Hook for managing force-directed graph simulation
 *
 * Initializes node positions, runs physics simulation in requestAnimationFrame,
 * and provides controls for pausing/resuming.
 *
 * @param nodes Array of graph nodes
 * @param edges Array of graph edges
 * @param config Force simulation configuration
 * @returns Object with current nodes, simulation control methods, and state
 *
 * @example
 * ```tsx
 * const { nodes: simulatedNodes, pause, resume, reset } = useForceSimulation(
 *   nodes,
 *   edges,
 *   { nodeStrength: -50, linkDistance: 100 }
 * );
 * ```
 */
export function useForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  config: ForceSimulationConfig = {}
) {
  // Merge with defaults
  const {
    nodeStrength = -50,
    linkDistance = 100,
    chargeStrength = -300,
    theta = 0.9,
    damping = 0.6,
    timeStep = 0.02,
    minVelocity = 0.01,
  } = config;

  // State for simulated nodes with positions
  const [simulatedNodes, setSimulatedNodes] = useState<SimulatedNode[]>([]);
  const [isSimulating, setIsSimulating] = useState(true);
  const [isSettled, setIsSettled] = useState(false);

  // Refs for simulation state
  const nodesRef = useRef<SimulatedNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const isSimulatingRef = useRef(true);
  const animationFrameRef = useRef<number | null>(null);
  const velocityTrackerRef = useRef<number>(0);

  // Initialize nodes with positions
  useEffect(() => {
    const initializedNodes: SimulatedNode[] = nodes.map((node) => ({
      ...node,
      position: node.position || {
        x: Math.random() * 400 - 200,
        y: Math.random() * 400 - 200,
        z: Math.random() * 200 - 100,
      },
      vx: 0,
      vy: 0,
      vz: 0,
      fx: 0,
      fy: 0,
      fz: 0,
    }));

    nodesRef.current = initializedNodes;
    edgesRef.current = edges;
    setSimulatedNodes(initializedNodes);
  }, [nodes, edges]);

  // Create adjacency map for faster lookup
  const buildAdjacencyMap = () => {
    const map = new Map<string, string[]>();
    edgesRef.current.forEach((edge) => {
      if (!map.has(edge.source)) map.set(edge.source, []);
      if (!map.has(edge.target)) map.set(edge.target, []);
      map.get(edge.source)!.push(edge.target);
      map.get(edge.target)!.push(edge.source);
    });
    return map;
  };

  // Calculate forces between nodes
  const calculateForces = () => {
    const adjMap = buildAdjacencyMap();
    const n = nodesRef.current.length;

    // Reset forces
    nodesRef.current.forEach((node) => {
      node.fx = 0;
      node.fy = 0;
      node.fz = 0;
    });

    // Coulomb repulsion between all nodes (O(n²) - optimize later with quadtree)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const nodeA = nodesRef.current[i];
        const nodeB = nodesRef.current[j];

        const dx = nodeB.position!.x - nodeA.position!.x;
        const dy = nodeB.position!.y - nodeA.position!.y;
        const dz = (nodeB.position!.z || 0) - (nodeA.position!.z || 0);

        const distSq = dx * dx + dy * dy + dz * dz + 1; // +1 to prevent division by zero
        const dist = Math.sqrt(distSq);

        // Repulsive force
        const repulsionStrength = chargeStrength / distSq;
        const fx = (dx / dist) * repulsionStrength;
        const fy = (dy / dist) * repulsionStrength;
        const fz = (dz / dist) * repulsionStrength;

        nodeA.fx! -= fx;
        nodeA.fy! -= fy;
        nodeA.fz! -= fz;
        nodeB.fx! += fx;
        nodeB.fy! += fy;
        nodeB.fz! += fz;
      }
    }

    // Hooke's law attraction between connected nodes
    edgesRef.current.forEach((edge) => {
      const nodeA = nodesRef.current.find((n) => n.id === edge.source);
      const nodeB = nodesRef.current.find((n) => n.id === edge.target);

      if (nodeA && nodeB) {
        const dx = nodeB.position!.x - nodeA.position!.x;
        const dy = nodeB.position!.y - nodeA.position!.y;
        const dz = (nodeB.position!.z || 0) - (nodeA.position!.z || 0);

        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const displacement = dist - (linkDistance * (edge.weight || 1));

        const attractionStrength = nodeStrength * displacement / dist;
        const fx = (dx / dist) * attractionStrength;
        const fy = (dy / dist) * attractionStrength;
        const fz = (dz / dist) * attractionStrength;

        nodeA.fx! += fx;
        nodeA.fy! += fy;
        nodeA.fz! += fz;
        nodeB.fx! -= fx;
        nodeB.fy! -= fy;
        nodeB.fz! -= fz;
      }
    });
  };

  // Update velocities and positions
  const updatePositions = () => {
    let maxVelocity = 0;

    nodesRef.current.forEach((node) => {
      // Update velocity with damping
      node.vx = ((node.vx || 0) + node.fx! * timeStep) * damping;
      node.vy = ((node.vy || 0) + node.fy! * timeStep) * damping;
      node.vz = ((node.vz || 0) + (node.fz || 0) * timeStep) * damping;

      // Update position
      node.position!.x += node.vx * timeStep;
      node.position!.y += node.vy * timeStep;
      node.position!.z = (node.position!.z || 0) + node.vz * timeStep;

      // Track max velocity for settling detection
      const velocity = Math.sqrt(node.vx ** 2 + node.vy ** 2 + (node.vz || 0) ** 2);
      maxVelocity = Math.max(maxVelocity, velocity);
    });

    return maxVelocity;
  };

  // Main simulation loop
  const runSimulation = () => {
    if (!isSimulatingRef.current) {
      animationFrameRef.current = null;
      return;
    }

    calculateForces();
    const maxVelocity = updatePositions();

    // Check if simulation has settled
    if (maxVelocity < minVelocity) {
      velocityTrackerRef.current++;
      if (velocityTrackerRef.current > 60) {
        // Settled for 60+ frames (~1 second at 60fps)
        setIsSettled(true);
        isSimulatingRef.current = false;
      }
    } else {
      velocityTrackerRef.current = 0;
      setIsSettled(false);
    }

    setSimulatedNodes([...nodesRef.current]);
    animationFrameRef.current = requestAnimationFrame(runSimulation);
  };

  // Start simulation
  useEffect(() => {
    if (isSimulating && nodesRef.current.length > 0) {
      isSimulatingRef.current = true;
      velocityTrackerRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(runSimulation);

      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isSimulating]);

  // Control methods
  const pause = () => {
    setIsSimulating(false);
    isSimulatingRef.current = false;
  };

  const resume = () => {
    setIsSimulating(true);
    isSimulatingRef.current = true;
    velocityTrackerRef.current = 0;
    setIsSettled(false);
  };

  const reset = () => {
    nodesRef.current.forEach((node) => {
      node.position = {
        x: Math.random() * 400 - 200,
        y: Math.random() * 400 - 200,
        z: Math.random() * 200 - 100,
      };
      node.vx = 0;
      node.vy = 0;
      node.vz = 0;
      node.fx = 0;
      node.fy = 0;
      node.fz = 0;
    });
    setSimulatedNodes([...nodesRef.current]);
    setIsSettled(false);
    resume();
  };

  const setNodePosition = (nodeId: string, position: { x: number; y: number; z?: number }) => {
    const node = nodesRef.current.find((n) => n.id === nodeId);
    if (node) {
      node.position = position;
      node.vx = 0;
      node.vy = 0;
      node.vz = 0;
      setSimulatedNodes([...nodesRef.current]);
    }
  };

  return {
    nodes: simulatedNodes,
    isSimulating,
    isSettled,
    pause,
    resume,
    reset,
    setNodePosition,
  };
}
