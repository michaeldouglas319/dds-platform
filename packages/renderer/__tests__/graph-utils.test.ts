/**
 * Graph Utilities Unit Tests
 *
 * Comprehensive tests for viewport, filtering, selection, and interaction utilities.
 * Tests cover: camera calculations, zoom operations, node filtering, path finding,
 * and tooltip positioning.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Viewport
  calculateCameraPosition,
  createViewportConfig,
  zoomToNode,
  zoomToSelection,
  resetViewport,
  calculateGraphBounds,
  clampZoom,
} from '../lib/graph-utils/viewport';
import {
  // Filtering
  nodeMatchesFilter,
  filterNodes,
  filterEdges,
  applyGraphFilter,
  calculateSearchRelevance,
  searchNodes,
  buildFilter,
  isFilterEmpty,
  mergeFilters,
} from '../lib/graph-utils/filtering';
import {
  // Selection
  findRelatedNodes,
  highlightConnectedComponent,
  findShortestPath,
  findEdgesBetweenNodes,
  calculateDegreeCentrality,
  findMostCentralNode,
} from '../lib/graph-utils/selection';
import {
  // Interaction
  getNodeTooltipContent,
  formatTooltipText,
  calculateTooltipPosition,
  isPointNearNode,
  hasHeldLongEnough,
} from '../lib/graph-utils/interaction';
import type { GraphNode, GraphEdge, GraphData, GraphFilter } from '../lib/graph-utils/types';

// ─── Mock Data ────────────────────────────────────────────────────

const mockNodes: GraphNode[] = [
  {
    id: 'node-1',
    type: 'entry',
    label: 'Disease Outbreak',
    description: 'Recent disease outbreak in Central Africa',
    tags: ['disease', 'critical'],
    position: { x: 0, y: 0 },
    metadata: {
      source: 'who',
      published_at: '2026-04-15T10:00:00Z',
    },
  },
  {
    id: 'node-2',
    type: 'entry',
    label: 'Health Response',
    description: 'WHO health response initiatives',
    tags: ['disease'],
    position: { x: 50, y: 50 },
    metadata: {
      source: 'who',
      published_at: '2026-04-10T09:00:00Z',
    },
  },
  {
    id: 'node-3',
    type: 'event',
    label: 'Crisis Meeting',
    tags: ['critical'],
    position: { x: -50, y: 50 },
    metadata: {
      source: 'un',
      published_at: '2026-04-12T14:00:00Z',
    },
  },
  {
    id: 'node-4',
    type: 'concept',
    label: 'Pandemic Preparedness',
    position: { x: 100, y: 100 },
    tags: ['infrastructure'],
    metadata: { source: 'whitehouse' },
  },
];

const mockEdges: GraphEdge[] = [
  {
    id: 'edge-1',
    source: 'node-1',
    target: 'node-2',
    type: 'related',
    weight: 0.8,
  },
  {
    id: 'edge-2',
    source: 'node-2',
    target: 'node-3',
    type: 'temporal',
    weight: 0.6,
  },
  {
    id: 'edge-3',
    source: 'node-1',
    target: 'node-4',
    type: 'caused_by',
    weight: 0.5,
  },
];

const mockGraphData: GraphData = {
  nodes: mockNodes,
  edges: mockEdges,
};

// ─── VIEWPORT TESTS ──────────────────────────────────────────────

describe('Viewport Utilities', () => {
  describe('createViewportConfig', () => {
    it('creates config with default values', () => {
      const config = createViewportConfig(800, 600);
      expect(config.width).toBe(800);
      expect(config.height).toBe(600);
      expect(config.aspectRatio).toBeCloseTo(800 / 600);
      expect(config.defaultZoom).toBe(1);
      expect(config.minZoom).toBe(0.1);
      expect(config.maxZoom).toBe(10);
    });

    it('accepts optional overrides', () => {
      const config = createViewportConfig(800, 600, { defaultZoom: 2, maxZoom: 20 });
      expect(config.defaultZoom).toBe(2);
      expect(config.maxZoom).toBe(20);
    });
  });

  describe('calculateCameraPosition', () => {
    it('calculates force-directed camera', () => {
      const camera = calculateCameraPosition('force-directed', mockGraphData, createViewportConfig(800, 600));
      expect(camera.position.z).toBeGreaterThan(0);
      expect(camera.rotation.x).toBeLessThan(0); // Angled downward
      expect(camera.fov).toBe(75);
    });

    it('calculates layered-universe camera', () => {
      const camera = calculateCameraPosition('layered-universe', mockGraphData, createViewportConfig(800, 600));
      expect(camera.position.z).toBeGreaterThan(0);
      expect(camera.rotation.x).toEqual(-Math.PI / 2.2);
    });

    it('calculates globe camera', () => {
      const camera = calculateCameraPosition('globe', mockGraphData, createViewportConfig(800, 600));
      expect(camera.position.x).toBe(0);
      expect(camera.position.y).toBe(0);
      expect(camera.position.z).toBeGreaterThan(0);
    });

    it('calculates grid camera', () => {
      const camera = calculateCameraPosition('entry-grid', mockGraphData, createViewportConfig(800, 600));
      expect(camera.rotation.x).toBe(-Math.PI / 2);
    });
  });

  describe('zoomToNode', () => {
    it('centers on single node', () => {
      const viewport = zoomToNode(mockNodes[0], 50);
      expect(viewport.centerX).toBe(0);
      expect(viewport.centerY).toBe(0);
      expect(viewport.zoom).toBeGreaterThan(1);
    });

    it('handles node without position', () => {
      const nodeNoPos = { ...mockNodes[0], position: undefined };
      const viewport = zoomToNode(nodeNoPos, 50);
      expect(viewport.centerX).toBe(0);
      expect(viewport.centerY).toBe(0);
      expect(viewport.zoom).toBe(1);
    });
  });

  describe('zoomToSelection', () => {
    it('frames multiple nodes', () => {
      const viewport = zoomToSelection(mockNodes.slice(0, 2), 50);
      expect(viewport.zoom).toBeGreaterThan(0);
      expect(viewport.centerX).toEqual(expect.any(Number));
    });

    it('handles empty selection', () => {
      const viewport = zoomToSelection([], 50);
      expect(viewport.zoom).toBe(1);
    });
  });

  describe('calculateGraphBounds', () => {
    it('calculates correct bounding box', () => {
      const bounds = calculateGraphBounds(mockNodes);
      expect(bounds.minX).toBeLessThanOrEqual(bounds.maxX);
      expect(bounds.minY).toBeLessThanOrEqual(bounds.maxY);
      expect(bounds.width).toBeGreaterThanOrEqual(0);
      expect(bounds.height).toBeGreaterThanOrEqual(0);
    });

    it('returns zero bounds for empty nodes', () => {
      const bounds = calculateGraphBounds([]);
      expect(bounds.width).toBe(0);
      expect(bounds.height).toBe(0);
    });
  });

  describe('clampZoom', () => {
    it('clamps zoom to range', () => {
      expect(clampZoom(0.05, 0.1, 10)).toBe(0.1);
      expect(clampZoom(15, 0.1, 10)).toBe(10);
      expect(clampZoom(5, 0.1, 10)).toBe(5);
    });
  });

  describe('resetViewport', () => {
    it('returns default viewport state', () => {
      const viewport = resetViewport();
      expect(viewport.centerX).toBe(0);
      expect(viewport.centerY).toBe(0);
      expect(viewport.zoom).toBeGreaterThan(0);
      expect(viewport.rotation).toBeDefined();
    });
  });
});

// ─── FILTERING TESTS ──────────────────────────────────────────────

describe('Filtering Utilities', () => {
  describe('nodeMatchesFilter', () => {
    it('matches nodes by type', () => {
      const filter: GraphFilter = { nodeTypes: ['entry'] };
      expect(nodeMatchesFilter(mockNodes[0], filter)).toBe(true);
      expect(nodeMatchesFilter(mockNodes[3], filter)).toBe(false);
    });

    it('matches nodes by tags', () => {
      const filter: GraphFilter = { tags: ['disease'] };
      expect(nodeMatchesFilter(mockNodes[0], filter)).toBe(true);
      expect(nodeMatchesFilter(mockNodes[3], filter)).toBe(false);
    });

    it('matches nodes by source', () => {
      const filter: GraphFilter = { sources: ['who'] };
      expect(nodeMatchesFilter(mockNodes[0], filter)).toBe(true);
      expect(nodeMatchesFilter(mockNodes[3], filter)).toBe(false);
    });

    it('performs case-insensitive search', () => {
      const filter: GraphFilter = { searchQuery: 'DISEASE' };
      expect(nodeMatchesFilter(mockNodes[0], filter)).toBe(true);
    });

    it('returns true for empty filter', () => {
      const filter: GraphFilter = {};
      expect(nodeMatchesFilter(mockNodes[0], filter)).toBe(true);
    });
  });

  describe('filterNodes', () => {
    it('filters multiple nodes by criteria', () => {
      const filter: GraphFilter = { tags: ['critical'] };
      const result = filterNodes(mockNodes, filter);
      expect(result.length).toBe(2);
      expect(result.every(n => n.tags?.includes('critical'))).toBe(true);
    });
  });

  describe('filterEdges', () => {
    it('keeps edges between visible nodes', () => {
      const visibleNodeIds = new Set(['node-1', 'node-2']);
      const result = filterEdges(mockEdges, visibleNodeIds);
      expect(result.length).toBe(1);
      expect(result[0].source).toBe('node-1');
      expect(result[0].target).toBe('node-2');
    });
  });

  describe('applyGraphFilter', () => {
    it('filters complete graph', () => {
      const filter: GraphFilter = { nodeTypes: ['entry'] };
      const result = applyGraphFilter(mockGraphData, filter);
      expect(result.nodes.length).toBe(2);
      expect(result.resultCount).toBe(2);
      expect(result.totalNodes).toBe(mockGraphData.nodes.length);
    });
  });

  describe('calculateSearchRelevance', () => {
    it('scores label matches highest', () => {
      const score = calculateSearchRelevance(mockNodes[0], 'disease');
      expect(score).toBeGreaterThan(0);
    });

    it('gives bonus for exact start match', () => {
      const scoreStart = calculateSearchRelevance(mockNodes[0], 'disease');
      const scoreMiddle = calculateSearchRelevance(mockNodes[0], 'outbreak');
      expect(scoreStart).toBeGreaterThanOrEqual(scoreMiddle);
    });
  });

  describe('searchNodes', () => {
    it('returns matching nodes sorted by relevance', () => {
      const results = searchNodes(mockNodes, 'disease', 5);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].label).toContain('Disease');
    });

    it('returns empty for non-matching query', () => {
      const results = searchNodes(mockNodes, 'xyzabc');
      expect(results.length).toBe(0);
    });

    it('respects limit parameter', () => {
      const results = searchNodes(mockNodes, 'o', 1);
      expect(results.length).toBeLessThanOrEqual(1);
    });
  });

  describe('buildFilter', () => {
    it('chains filter criteria', () => {
      const filter = buildFilter()
        .withTypes('entry')
        .withTags('disease')
        .withSources('who')
        .build();

      expect(filter.nodeTypes).toContain('entry');
      expect(filter.tags).toContain('disease');
      expect(filter.sources).toContain('who');
    });
  });

  describe('isFilterEmpty', () => {
    it('detects empty filters', () => {
      expect(isFilterEmpty({})).toBe(true);
      expect(isFilterEmpty({ nodeTypes: ['entry'] })).toBe(false);
    });
  });

  describe('mergeFilters', () => {
    it('combines multiple filters', () => {
      const filter1: GraphFilter = { nodeTypes: ['entry'] };
      const filter2: GraphFilter = { tags: ['disease'] };
      const merged = mergeFilters(filter1, filter2);

      expect(merged.nodeTypes).toContain('entry');
      expect(merged.tags).toContain('disease');
    });
  });
});

// ─── SELECTION TESTS ──────────────────────────────────────────────

describe('Selection & Path Utilities', () => {
  describe('findRelatedNodes', () => {
    it('finds N-hop neighbors', () => {
      const result = findRelatedNodes('node-1', mockNodes, mockEdges, 1);
      expect(result.relatedNodes.length).toBeGreaterThan(0);
      expect(result.hopDistance.get('node-2')).toBe(1);
    });

    it('respects max depth', () => {
      const result = findRelatedNodes('node-1', mockNodes, mockEdges, 1);
      const maxHop = Math.max(...result.hopDistance.values());
      expect(maxHop).toBeLessThanOrEqual(1);
    });

    it('handles unknown node', () => {
      const result = findRelatedNodes('unknown-node', mockNodes, mockEdges, 2);
      expect(result.relatedNodes.length).toBe(0);
    });
  });

  describe('highlightConnectedComponent', () => {
    it('finds all nodes in connected component', () => {
      const result = highlightConnectedComponent('node-1', mockNodes, mockEdges);
      expect(result.componentNodes.length).toBeGreaterThanOrEqual(1);
      expect(result.componentSize).toBeGreaterThanOrEqual(1);
    });
  });

  describe('findShortestPath', () => {
    it('finds path between connected nodes', () => {
      const path = findShortestPath('node-1', 'node-2', mockNodes, mockEdges);
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toBe('node-1');
      expect(path[path.length - 1]).toBe('node-2');
    });

    it('returns empty for disconnected nodes', () => {
      // Create isolated node
      const isolatedNode: GraphNode = {
        id: 'isolated',
        type: 'concept',
        label: 'Isolated',
        position: { x: 1000, y: 1000 },
      };
      const nodes = [...mockNodes, isolatedNode];

      const path = findShortestPath('node-1', 'isolated', nodes, mockEdges);
      expect(path.length).toBe(0);
    });
  });

  describe('findEdgesBetweenNodes', () => {
    it('finds edges connecting specified nodes', () => {
      const edges = findEdgesBetweenNodes(['node-1', 'node-2'], mockEdges);
      expect(edges.length).toBeGreaterThan(0);
    });
  });

  describe('calculateDegreeCentrality', () => {
    it('counts node connections', () => {
      const degree = calculateDegreeCentrality('node-1', mockEdges);
      expect(degree).toBeGreaterThan(0);
    });
  });

  describe('findMostCentralNode', () => {
    it('returns node with highest degree', () => {
      const central = findMostCentralNode(mockNodes, mockEdges);
      expect(central).toBeDefined();
      expect(central?.id).toBeTruthy();
    });

    it('handles empty nodes', () => {
      const central = findMostCentralNode([], mockEdges);
      expect(central).toBeUndefined();
    });
  });
});

// ─── INTERACTION TESTS ────────────────────────────────────────────

describe('Interaction & Tooltip Utilities', () => {
  describe('getNodeTooltipContent', () => {
    it('extracts node content', () => {
      const content = getNodeTooltipContent(mockNodes[0]);
      expect(content.label).toBe('Disease Outbreak');
      expect(content.description).toBeTruthy();
      expect(content.tags).toBeDefined();
    });
  });

  describe('formatTooltipText', () => {
    it('formats node as readable text', () => {
      const text = formatTooltipText(mockNodes[0]);
      expect(text).toContain('Disease Outbreak');
      expect(text).toContain('disease');
    });
  });

  describe('calculateTooltipPosition', () => {
    it('avoids viewport overflow', () => {
      const pos = calculateTooltipPosition(700, 500, 200, 100, 800, 600);
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.x + 200).toBeLessThanOrEqual(800);
      expect(pos.y).toBeGreaterThanOrEqual(0);
      expect(pos.y + 100).toBeLessThanOrEqual(600);
    });
  });

  describe('isPointNearNode', () => {
    it('detects points near node', () => {
      const result = isPointNearNode({ x: 0, y: 0 }, 10, 10, 20);
      expect(result).toBe(true);
    });

    it('rejects distant points', () => {
      const result = isPointNearNode({ x: 0, y: 0 }, 100, 100, 20);
      expect(result).toBe(false);
    });

    it('handles missing position', () => {
      const result = isPointNearNode(undefined, 10, 10, 20);
      expect(result).toBe(false);
    });
  });

  describe('hasHeldLongEnough', () => {
    it('returns false initially', () => {
      const hoverState = { elementId: 'node-1', elementType: 'node' as const, hoveredAt: Date.now() };
      expect(hasHeldLongEnough(hoverState, 300)).toBe(false);
    });

    it('returns true after delay', async () => {
      const hoverState = { elementId: 'node-1', elementType: 'node' as const, hoveredAt: Date.now() - 400 };
      expect(hasHeldLongEnough(hoverState, 300)).toBe(true);
    });
  });
});
