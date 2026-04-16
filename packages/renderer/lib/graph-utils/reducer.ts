/**
 * Knowledge Graph View State Reducer
 *
 * Pure reducer function for GraphViewState mutations.
 * Handles all state transitions: selection, filtering, viewport, tooltip, etc.
 *
 * @module @dds/renderer/lib/graph-utils/reducer
 */

import type { GraphViewState, GraphViewAction, GraphViewport, GraphTooltip } from './types';

/**
 * Default viewport configuration (initial state)
 */
const DEFAULT_VIEWPORT: GraphViewport = {
  centerX: 0,
  centerY: 0,
  centerZ: 0,
  zoom: 1,
  rotation: {
    x: 0,
    y: 0,
    z: 0,
  },
  fov: 75,
  near: 0.1,
  far: 1000,
};

/**
 * Default tooltip configuration (initial state)
 */
const DEFAULT_TOOLTIP: GraphTooltip = {
  visible: false,
  x: 0,
  y: 0,
  contentType: undefined,
  targetId: undefined,
  content: undefined,
  delay: 200,
};

/**
 * Initial state factory for GraphViewState
 * Returns a fresh state object with all defaults
 */
export function createInitialGraphViewState(): GraphViewState {
  return {
    selectedNodes: [],
    hoveredNodeId: undefined,
    filter: {},
    filteredData: {
      nodes: [],
      edges: [],
      totalNodes: 0,
      totalEdges: 0,
      resultCount: 0,
    },
    viewport: { ...DEFAULT_VIEWPORT },
    tooltip: { ...DEFAULT_TOOLTIP },
    isLoading: false,
    error: undefined,
    isAnimating: false,
    viewConfig: {
      showLabels: true,
      showEdges: true,
      edgeThickness: 1,
      nodeSize: 1,
      animationDuration: 300,
    },
  };
}

/**
 * Graph view state reducer
 * Pure function that takes current state and an action, returns new state
 *
 * @param state Current GraphViewState
 * @param action GraphViewAction to process
 * @returns New GraphViewState after applying the action
 *
 * @throws Never throws - returns current state if action is invalid
 */
export function graphViewReducer(state: GraphViewState, action: GraphViewAction): GraphViewState {
  switch (action.type) {
    // ─── Selection Actions ─────────────────────────────────────────

    case 'SELECT_NODE': {
      const { nodeId } = action.payload;
      // Check if node is already selected
      const alreadySelected = state.selectedNodes.some((n) => n.nodeId === nodeId);
      if (alreadySelected) {
        return state;
      }
      return {
        ...state,
        selectedNodes: [...state.selectedNodes, action.payload],
      };
    }

    case 'DESELECT_NODE': {
      const { nodeId } = action.payload;
      return {
        ...state,
        selectedNodes: state.selectedNodes.filter((n) => n.nodeId !== nodeId),
      };
    }

    case 'CLEAR_SELECTION': {
      return {
        ...state,
        selectedNodes: [],
      };
    }

    // ─── Hover Actions ────────────────────────────────────────────

    case 'HOVER_NODE': {
      const { nodeId } = action.payload;
      return {
        ...state,
        hoveredNodeId: nodeId,
      };
    }

    // ─── Filter Actions ───────────────────────────────────────────

    case 'SET_FILTER': {
      return {
        ...state,
        filter: action.payload,
      };
    }

    case 'UPDATE_FILTER': {
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload,
        },
      };
    }

    case 'CLEAR_FILTER': {
      return {
        ...state,
        filter: {},
      };
    }

    case 'SET_FILTERED_DATA': {
      return {
        ...state,
        filteredData: action.payload,
      };
    }

    // ─── Viewport Actions ─────────────────────────────────────────

    case 'SET_VIEWPORT': {
      return {
        ...state,
        viewport: action.payload,
      };
    }

    case 'UPDATE_VIEWPORT': {
      return {
        ...state,
        viewport: {
          ...state.viewport,
          ...action.payload,
        },
      };
    }

    case 'RESET_VIEWPORT': {
      return {
        ...state,
        viewport: { ...DEFAULT_VIEWPORT },
      };
    }

    // ─── Tooltip Actions ──────────────────────────────────────────

    case 'SHOW_TOOLTIP': {
      return {
        ...state,
        tooltip: {
          ...action.payload,
        },
      };
    }

    case 'HIDE_TOOLTIP': {
      return {
        ...state,
        tooltip: { ...DEFAULT_TOOLTIP },
      };
    }

    // ─── Loading and Error Actions ────────────────────────────────

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    case 'SET_ERROR': {
      return {
        ...state,
        error: action.payload,
      };
    }

    case 'SET_ANIMATING': {
      return {
        ...state,
        isAnimating: action.payload,
      };
    }

    // ─── View Config Actions ──────────────────────────────────────

    case 'UPDATE_VIEW_CONFIG': {
      return {
        ...state,
        viewConfig: {
          ...state.viewConfig,
          ...action.payload,
        },
      };
    }

    // ─── Reset Actions ────────────────────────────────────────────

    case 'RESET_STATE': {
      const initialState = createInitialGraphViewState();
      return {
        ...initialState,
        ...action.payload,
      };
    }

    // ─── Default (unknown action) ─────────────────────────────────

    default: {
      // Unknown action type - return state unchanged
      return state;
    }
  }
}
