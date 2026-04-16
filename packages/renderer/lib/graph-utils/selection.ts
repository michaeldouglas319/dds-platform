/**
 * Selection & Path Highlighting Utilities
 *
 * Pure functions for finding related nodes, highlighting connected components,
 * and calculating N-hop neighborhoods for showing "what's related to this selection".
 *
 * @module @dds/renderer/lib/graph-utils/selection
 */

import type { GraphNode, GraphEdge } from './types';

// ─── Connected Component Discovery ────────────────────────────────

/**
 * Result of finding related nodes for a selection.
 */
export interface RelatedNodesResult {
  /** The initially selected node */
  selectedNode: GraphNode;
  /** All nodes within N hops of the selected node */
  relatedNodes: GraphNode[];
  /** All edges between related nodes */
  relatedEdges: GraphEdge[];
  /** The hop distance for each related node */
  hopDistance: Map<string, number>;
}

/**
 * Find all nodes related to a given node within a specified hop distance.
 * Returns the selected node, all related nodes, connecting edges, and hop distances.
 *
 * @param selectedNodeId - ID of the node to find relations for
 * @param nodes - All nodes in the graph
 * @param edges - All edges in the graph
 * @param maxDepth - Maximum number of hops (1 = direct neighbors, 2 = neighbors of neighbors, etc.)
 * @returns RelatedNodesResult with selected node, related nodes, edges, and hop distances
 */
export function findRelatedNodes(
  selectedNodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
  maxDepth: number = 2
): RelatedNodesResult {
  // Create node map for O(1) lookup
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Find the selected node
  const selectedNode = nodeMap.get(selectedNodeId);
  if (!selectedNode) {
    return {
      selectedNode: { id: selectedNodeId, type: 'concept', label: 'Unknown' },
      relatedNodes: [],
      relatedEdges: [],
      hopDistance: new Map(),
    };
  }

  // Create adjacency list for efficient traversal
  const adjacencyList = new Map<string, Set<string>>();
  for (const node of nodes) {
    adjacencyList.set(node.id, new Set());
  }

  for (const edge of edges) {
    adjacencyList.get(edge.source)?.add(edge.target);
    adjacencyList.get(edge.target)?.add(edge.source); // Treat as undirected
  }

  // BFS to find all nodes within maxDepth hops
  const visitedNodes = new Set<string>();
  const hopDistance = new Map<string, number>();
  const queue: [string, number][] = [[selectedNodeId, 0]];

  visitedNodes.add(selectedNodeId);
  hopDistance.set(selectedNodeId, 0);

  while (queue.length > 0) {
    const [currentId, currentHop] = queue.shift()!;

    // Don't explore beyond maxDepth
    if (currentHop >= maxDepth) {
      continue;
    }

    const neighbors = adjacencyList.get(currentId) ?? new Set();
    for (const neighborId of neighbors) {
      if (!visitedNodes.has(neighborId)) {
        visitedNodes.add(neighborId);
        hopDistance.set(neighborId, currentHop + 1);
        queue.push([neighborId, currentHop + 1]);
      }
    }
  }

  // Collect related nodes and edges
  const relatedNodeIds = new Set(visitedNodes);
  relatedNodeIds.delete(selectedNodeId); // Remove the selected node itself from "related"

  const relatedNodes = Array.from(relatedNodeIds)
    .map(id => nodeMap.get(id)!)
    .filter(Boolean);

  // Collect edges between any of the visited nodes (selected + related)
  const relatedEdges = edges.filter(
    edge => visitedNodes.has(edge.source) && visitedNodes.has(edge.target)
  );

  return {
    selectedNode,
    relatedNodes,
    relatedEdges,
    hopDistance,
  };
}

// ─── Connected Component Analysis ────────────────────────────────

/**
 * Result of finding a connected component.
 */
export interface ConnectedComponentResult {
  /** The root/selected node */
  rootNode: GraphNode;
  /** All nodes in the connected component (including root) */
  componentNodes: GraphNode[];
  /** All edges within the component */
  componentEdges: GraphEdge[];
  /** Size of the component (number of nodes) */
  componentSize: number;
}

/**
 * Find the entire connected component containing a given node.
 * Uses flood-fill to discover all nodes connected to the selected node.
 *
 * @param selectedNodeId - ID of the node to find the component for
 * @param nodes - All nodes in the graph
 * @param edges - All edges in the graph
 * @returns ConnectedComponentResult with root node, component nodes, edges, and size
 */
export function highlightConnectedComponent(
  selectedNodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[]
): ConnectedComponentResult {
  // Create node map for O(1) lookup
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Find the selected node
  const rootNode = nodeMap.get(selectedNodeId);
  if (!rootNode) {
    return {
      rootNode: { id: selectedNodeId, type: 'concept', label: 'Unknown' },
      componentNodes: [],
      componentEdges: [],
      componentSize: 0,
    };
  }

  // Create adjacency list (undirected)
  const adjacencyList = new Map<string, Set<string>>();
  for (const node of nodes) {
    adjacencyList.set(node.id, new Set());
  }

  for (const edge of edges) {
    adjacencyList.get(edge.source)?.add(edge.target);
    adjacencyList.get(edge.target)?.add(edge.source);
  }

  // DFS to find all nodes in the connected component
  const componentNodeIds = new Set<string>();
  const stack = [selectedNodeId];
  componentNodeIds.add(selectedNodeId);

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    const neighbors = adjacencyList.get(currentId) ?? new Set();

    for (const neighborId of neighbors) {
      if (!componentNodeIds.has(neighborId)) {
        componentNodeIds.add(neighborId);
        stack.push(neighborId);
      }
    }
  }

  // Collect component nodes and edges
  const componentNodes = Array.from(componentNodeIds)
    .map(id => nodeMap.get(id)!)
    .filter(Boolean);

  const componentEdges = edges.filter(
    edge => componentNodeIds.has(edge.source) && componentNodeIds.has(edge.target)
  );

  return {
    rootNode,
    componentNodes,
    componentEdges,
    componentSize: componentNodeIds.size,
  };
}

// ─── Shortest Path Finding ───────────────────────────────────────

/**
 * Find the shortest path between two nodes using BFS.
 * Returns the sequence of node IDs forming the path.
 */
export function findShortestPath(
  sourceId: string,
  targetId: string,
  nodes: GraphNode[],
  edges: GraphEdge[]
): string[] {
  // Create adjacency list (undirected)
  const adjacencyList = new Map<string, Set<string>>();
  for (const node of nodes) {
    adjacencyList.set(node.id, new Set());
  }

  for (const edge of edges) {
    adjacencyList.get(edge.source)?.add(edge.target);
    adjacencyList.get(edge.target)?.add(edge.source);
  }

  // BFS to find shortest path
  const queue: [string, string[]][] = [[sourceId, [sourceId]]];
  const visited = new Set<string>([sourceId]);

  while (queue.length > 0) {
    const [currentId, path] = queue.shift()!;

    if (currentId === targetId) {
      return path;
    }

    const neighbors = adjacencyList.get(currentId) ?? new Set();
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push([neighborId, [...path, neighborId]]);
      }
    }
  }

  // No path found
  return [];
}

// ─── Multi-Node Selection Analysis ──────────────────────────────

/**
 * Find all edges connecting a set of nodes (for highlighting selected group).
 */
export function findEdgesBetweenNodes(
  nodeIds: string[],
  edges: GraphEdge[]
): GraphEdge[] {
  const nodeSet = new Set(nodeIds);
  return edges.filter(
    edge => nodeSet.has(edge.source) && nodeSet.has(edge.target)
  );
}

/**
 * Find bridge edges (edges connecting the selected group to external nodes).
 */
export function findBridgeEdges(
  selectedNodeIds: string[],
  allEdges: GraphEdge[]
): GraphEdge[] {
  const selectedSet = new Set(selectedNodeIds);
  return allEdges.filter(
    edge =>
      (selectedSet.has(edge.source) && !selectedSet.has(edge.target)) ||
      (!selectedSet.has(edge.source) && selectedSet.has(edge.target))
  );
}

/**
 * Find all nodes that connect the selected group to the rest of the graph.
 */
export function findBoundaryNodes(
  selectedNodeIds: string[],
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphNode[] {
  const bridgeEdges = findBridgeEdges(selectedNodeIds, edges);
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const selectedSet = new Set(selectedNodeIds);

  const boundaryNodeIds = new Set<string>();
  for (const edge of bridgeEdges) {
    const externalId = selectedSet.has(edge.source) ? edge.target : edge.source;
    boundaryNodeIds.add(externalId);
  }

  return Array.from(boundaryNodeIds)
    .map(id => nodeMap.get(id)!)
    .filter(Boolean);
}

// ─── Subgraph Extraction ────────────────────────────────────────

/**
 * Extract a subgraph containing specified nodes and all edges between them.
 */
export function extractSubgraph(
  nodeIds: string[],
  allNodes: GraphNode[],
  allEdges: GraphEdge[]
) {
  const nodeSet = new Set(nodeIds);
  const nodeMap = new Map(allNodes.map(n => [n.id, n]));

  const subgraphNodes = nodeIds
    .map(id => nodeMap.get(id)!)
    .filter(Boolean);

  const subgraphEdges = allEdges.filter(
    edge => nodeSet.has(edge.source) && nodeSet.has(edge.target)
  );

  return {
    nodes: subgraphNodes,
    edges: subgraphEdges,
  };
}

// ─── Node Centrality Metrics ───────────────────────────────────

/**
 * Calculate degree centrality for a node (number of connections).
 */
export function calculateDegreeCentrality(
  nodeId: string,
  edges: GraphEdge[]
): number {
  return edges.filter(e => e.source === nodeId || e.target === nodeId).length;
}

/**
 * Calculate betweenness centrality (how often node appears on shortest paths).
 * This is a simplified O(n²) implementation suitable for small graphs.
 */
export function calculateBetweennessCentrality(
  nodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[]
): number {
  let betweenness = 0;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const sourceId = nodes[i].id;
      const targetId = nodes[j].id;

      if (sourceId === nodeId || targetId === nodeId) {
        continue;
      }

      const path = findShortestPath(sourceId, targetId, nodes, edges);
      if (path.includes(nodeId)) {
        betweenness++;
      }
    }
  }

  return betweenness;
}

/**
 * Find the most central node (highest degree centrality).
 */
export function findMostCentralNode(
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphNode | undefined {
  if (nodes.length === 0) return undefined;

  let maxNode = nodes[0];
  let maxDegree = calculateDegreeCentrality(maxNode.id, edges);

  for (const node of nodes.slice(1)) {
    const degree = calculateDegreeCentrality(node.id, edges);
    if (degree > maxDegree) {
      maxDegree = degree;
      maxNode = node;
    }
  }

  return maxNode;
}
