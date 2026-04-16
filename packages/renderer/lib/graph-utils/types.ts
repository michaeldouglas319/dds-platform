/**
 * Knowledge Graph Types and Data Model
 *
 * Core TypeScript types for the multi-view knowledge graph system.
 * Defines nodes, edges, and view state for graph visualization and interaction.
 *
 * @module @dds/renderer/lib/graph-utils/types
 */

import type { UniversalSection } from '@dds/types';

// ─── Graph Node Types ─────────────────────────────────────────────

/**
 * GraphNode represents a single node in the knowledge graph.
 * Can be an entry, signal, person, organization, or concept.
 */
export interface GraphNode {
  /** Unique identifier for the node */
  id: string;

  /** Node type: 'entry', 'signal', 'person', 'organization', 'concept', 'event' */
  type: 'entry' | 'signal' | 'person' | 'organization' | 'concept' | 'event';

  /** Display label for the node */
  label: string;

  /** Optional description or preview text */
  description?: string;

  /** Tags for categorization ('disease', 'lethal', 'disaster', 'famine', etc.) */
  tags?: string[];

  /** Spatial position in 2D/3D space (for force-directed, layered layouts) */
  position?: {
    x: number;
    y: number;
    z?: number; // For 3D/layered views
  };

  /** Node metadata: color, size, icon, source, published_date, featured, etc. */
  metadata?: {
    color?: string;
    size?: number;
    icon?: string;
    source?: string; // 'who', 'interpol', 'un', 'whitehouse', etc.
    published_at?: string; // ISO 8601
    featured?: boolean;
    featured_rank?: number | null;
    [key: string]: unknown;
  };

  /** Connection/adjacency data for quick lookup */
  connectedNodeIds?: string[];

  /** Optional reference to underlying data object */
  sourceData?: UniversalSection;
}

// ─── Graph Edge Types ─────────────────────────────────────────────

/**
 * GraphEdge represents a connection between two nodes in the knowledge graph.
 * Can be a causal, semantic, temporal, or organizational relationship.
 */
export interface GraphEdge {
  /** Unique identifier for the edge */
  id: string;

  /** Source node ID */
  source: string;

  /** Target node ID */
  target: string;

  /** Edge type: 'related', 'caused_by', 'linked_to', 'temporal', 'hierarchical', etc. */
  type: 'related' | 'caused_by' | 'linked_to' | 'temporal' | 'hierarchical' | string;

  /** Strength of relationship (0-1) for weighted edges */
  weight?: number;

  /** Optional label describing the relationship */
  label?: string;

  /** Edge metadata: color, style, direction, etc. */
  metadata?: {
    color?: string;
    style?: 'solid' | 'dashed' | 'dotted';
    directed?: boolean;
    [key: string]: unknown;
  };
}

// ─── Graph Data Structure ─────────────────────────────────────────

/**
 * GraphData represents the complete knowledge graph data structure.
 * Contains all nodes, edges, and metadata about the graph.
 */
export interface GraphData {
  /** Array of all nodes in the graph */
  nodes: GraphNode[];

  /** Array of all edges in the graph */
  edges: GraphEdge[];

  /** Metadata about the graph */
  metadata?: {
    name?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
  };
}

// ─── Unified Graph Section Type ───────────────────────────────────

/**
 * UnifiedGraphSection extends UniversalSection to support knowledge-graph layouts.
 * Used for sections with display.layout = 'knowledge-graph'.
 */
export interface UnifiedGraphSection extends Omit<UniversalSection, 'display' | 'meta'> {
  display?: UniversalSection['display'] & {
    layout?: string; // 'force-directed', 'layered-universe', 'globe', 'entry-grid', etc.
  };

  /** Graph-specific data in the meta field */
  meta?: UniversalSection['meta'] & {
    graph?: GraphData;
    viewType?: 'force-directed' | 'layered-universe' | 'globe' | 'entry-grid';
    [key: string]: unknown;
  };
}

// ─── Selection and Filtering Types ────────────────────────────────

/**
 * SelectedNode represents user selection state for a single node.
 */
export interface SelectedNode {
  nodeId: string;
  selectedAt: number; // timestamp
  type: GraphNode['type'];
}

/**
 * GraphFilter represents filtering configuration for the graph.
 */
export interface GraphFilter {
  /** Filter by node types */
  nodeTypes?: GraphNode['type'][];

  /** Filter by tags */
  tags?: string[];

  /** Filter by source */
  sources?: string[];

  /** Filter by date range */
  dateRange?: {
    start?: string; // ISO 8601
    end?: string; // ISO 8601
  };

  /** Search query for full-text filtering */
  searchQuery?: string;

  /** Custom filter predicate */
  predicate?: (node: GraphNode) => boolean;
}

/**
 * FilteredGraphData represents the result of applying filters to a graph.
 */
export interface FilteredGraphData {
  /** Filtered nodes */
  nodes: GraphNode[];

  /** Filtered edges (only edges where both source and target are in filtered nodes) */
  edges: GraphEdge[];

  /** Total count before filtering */
  totalNodes: number;
  totalEdges: number;

  /** Number of results after filtering */
  resultCount: number;
}

// ─── Viewport and Camera Types ────────────────────────────────────

/**
 * GraphViewport represents the camera/viewport state for graph visualization.
 */
export interface GraphViewport {
  /** Center position in graph coordinate space */
  centerX: number;
  centerY: number;
  centerZ?: number;

  /** Zoom/scale level */
  zoom: number;

  /** Rotation angles for 3D views (in radians) */
  rotation?: {
    x?: number;
    y?: number;
    z?: number;
  };

  /** Field of view for perspective camera */
  fov?: number;

  /** Near/far clipping planes */
  near?: number;
  far?: number;
}

// ─── Tooltip and Interaction Types ────────────────────────────────

/**
 * GraphTooltip represents a floating tooltip showing node/edge details.
 */
export interface GraphTooltip {
  /** Visible state */
  visible: boolean;

  /** Position in viewport coordinates */
  x?: number;
  y?: number;

  /** Content type: 'node' or 'edge' */
  contentType?: 'node' | 'edge';

  /** ID of the node or edge being hovered */
  targetId?: string;

  /** Tooltip content */
  content?: string;

  /** Delay before showing (ms) */
  delay?: number;
}

// ─── Graph View State ─────────────────────────────────────────────

/**
 * GraphViewState represents the complete state of a knowledge graph view.
 * Includes selection, filtering, viewport, and interaction state.
 */
export interface GraphViewState {
  /** Selected nodes */
  selectedNodes: SelectedNode[];

  /** Currently hovered node ID */
  hoveredNodeId?: string;

  /** Active filter configuration */
  filter: GraphFilter;

  /** Filtered graph data (result of applying filter to base graph) */
  filteredData: FilteredGraphData;

  /** Viewport/camera state */
  viewport: GraphViewport;

  /** Tooltip state */
  tooltip: GraphTooltip;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error?: string;

  /** Animation state */
  isAnimating: boolean;

  /** View configuration */
  viewConfig?: {
    showLabels?: boolean;
    showEdges?: boolean;
    edgeThickness?: number;
    nodeSize?: number;
    animationDuration?: number; // ms
    [key: string]: unknown;
  };
}

// ─── Graph View Action Types ──────────────────────────────────────

/**
 * GraphViewAction represents a state mutation action.
 * Used by the reducer to update GraphViewState.
 */
export type GraphViewAction =
  | {
      type: 'SELECT_NODE';
      payload: SelectedNode;
    }
  | {
      type: 'DESELECT_NODE';
      payload: { nodeId: string };
    }
  | {
      type: 'CLEAR_SELECTION';
    }
  | {
      type: 'HOVER_NODE';
      payload: { nodeId?: string };
    }
  | {
      type: 'SET_FILTER';
      payload: GraphFilter;
    }
  | {
      type: 'UPDATE_FILTER';
      payload: Partial<GraphFilter>;
    }
  | {
      type: 'CLEAR_FILTER';
    }
  | {
      type: 'SET_FILTERED_DATA';
      payload: FilteredGraphData;
    }
  | {
      type: 'SET_VIEWPORT';
      payload: GraphViewport;
    }
  | {
      type: 'UPDATE_VIEWPORT';
      payload: Partial<GraphViewport>;
    }
  | {
      type: 'RESET_VIEWPORT';
    }
  | {
      type: 'SHOW_TOOLTIP';
      payload: Omit<GraphTooltip, 'visible'> & { visible: true };
    }
  | {
      type: 'HIDE_TOOLTIP';
    }
  | {
      type: 'SET_LOADING';
      payload: boolean;
    }
  | {
      type: 'SET_ERROR';
      payload: string | undefined;
    }
  | {
      type: 'SET_ANIMATING';
      payload: boolean;
    }
  | {
      type: 'UPDATE_VIEW_CONFIG';
      payload: Partial<GraphViewState['viewConfig']>;
    }
  | {
      type: 'RESET_STATE';
      payload?: Partial<GraphViewState>;
    };

// ─── Context Type ────────────────────────────────────────────────

/**
 * GraphViewContextType represents the complete context interface for graph views.
 */
export interface GraphViewContextType {
  state: GraphViewState;
  dispatch: (action: GraphViewAction) => void;
  selectNode: (nodeId: string, type: GraphNode['type']) => void;
  deselectNode: (nodeId: string) => void;
  clearSelection: () => void;
  hoverNode: (nodeId?: string) => void;
  setFilter: (filter: GraphFilter) => void;
  updateFilter: (filter: Partial<GraphFilter>) => void;
  clearFilter: () => void;
  setViewport: (viewport: GraphViewport) => void;
  updateViewport: (viewport: Partial<GraphViewport>) => void;
  resetViewport: () => void;
  showTooltip: (tooltip: Omit<GraphTooltip, 'visible'> & { visible: true }) => void;
  hideTooltip: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  setAnimating: (animating: boolean) => void;
  updateViewConfig: (config: Partial<GraphViewState['viewConfig']>) => void;
  resetState: (partialState?: Partial<GraphViewState>) => void;
}
