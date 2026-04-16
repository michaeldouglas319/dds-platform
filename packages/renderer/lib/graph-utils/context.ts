/**
 * Knowledge Graph View Context and Hooks
 *
 * React Context for managing knowledge graph state across views.
 * Provides useGraphView hook for consumer components.
 *
 * @module @dds/renderer/lib/graph-utils/context
 */

'use client';

import { createContext, useContext } from 'react';
import type { GraphViewContextType, GraphViewState, GraphViewAction, GraphFilter, GraphViewport, GraphTooltip, GraphNode } from './types';
import { createInitialGraphViewState } from './reducer';

/**
 * GraphViewContext holds the complete graph view state and dispatch function.
 * Consumers use the useGraphView hook to access this context.
 */
export const GraphViewContext = createContext<GraphViewContextType | null>(null);

/**
 * useGraphView hook
 *
 * Provides access to the knowledge graph view state and action dispatchers.
 * Must be used within a GraphViewProvider component.
 *
 * @returns GraphViewContextType with state and action functions
 * @throws Error if used outside of GraphViewProvider
 *
 * @example
 * ```tsx
 * const { state, selectNode, setFilter } = useGraphView();
 * console.log(state.selectedNodes);
 * selectNode('node-1', 'entry');
 * setFilter({ tags: ['disease'] });
 * ```
 */
export function useGraphView(): GraphViewContextType {
  const context = useContext(GraphViewContext);

  if (!context) {
    throw new Error(
      'useGraphView must be used within a GraphViewProvider. ' +
        'Make sure your component is wrapped with <GraphViewProvider> or a compatible provider.'
    );
  }

  return context;
}

/**
 * Hook to access only the graph view state (read-only)
 *
 * @returns Current GraphViewState
 * @throws Error if used outside of GraphViewProvider
 *
 * @example
 * ```tsx
 * const state = useGraphViewState();
 * console.log(state.selectedNodes, state.isLoading);
 * ```
 */
export function useGraphViewState(): GraphViewState {
  const context = useGraphView();
  return context.state;
}

/**
 * Hook to access the dispatch function directly
 *
 * @returns Dispatch function for GraphViewAction
 * @throws Error if used outside of GraphViewProvider
 *
 * @example
 * ```tsx
 * const dispatch = useGraphViewDispatch();
 * dispatch({ type: 'SELECT_NODE', payload: { nodeId: 'x', selectedAt: Date.now(), type: 'entry' } });
 * ```
 */
export function useGraphViewDispatch(): (action: GraphViewAction) => void {
  const context = useGraphView();
  return context.dispatch;
}

/**
 * Hook to access selection-related actions
 *
 * @returns Object with selection action functions
 * @throws Error if used outside of GraphViewProvider
 *
 * @example
 * ```tsx
 * const { selectNode, deselectNode, clearSelection, selectedNodes } = useGraphViewSelection();
 * selectNode('node-1', 'entry');
 * console.log(selectedNodes);
 * ```
 */
export function useGraphViewSelection() {
  const context = useGraphView();
  return {
    selectNode: context.selectNode,
    deselectNode: context.deselectNode,
    clearSelection: context.clearSelection,
    selectedNodes: context.state.selectedNodes,
    hoveredNodeId: context.state.hoveredNodeId,
    hoverNode: context.hoverNode,
  };
}

/**
 * Hook to access filter-related actions
 *
 * @returns Object with filter action functions and current filter
 * @throws Error if used outside of GraphViewProvider
 *
 * @example
 * ```tsx
 * const { setFilter, updateFilter, clearFilter, filter, filteredData } = useGraphViewFilter();
 * setFilter({ tags: ['disease'] });
 * console.log(filteredData.resultCount);
 * ```
 */
export function useGraphViewFilter() {
  const context = useGraphView();
  return {
    setFilter: context.setFilter,
    updateFilter: context.updateFilter,
    clearFilter: context.clearFilter,
    filter: context.state.filter,
    filteredData: context.state.filteredData,
  };
}

/**
 * Hook to access viewport/camera-related actions
 *
 * @returns Object with viewport action functions and current viewport
 * @throws Error if used outside of GraphViewProvider
 *
 * @example
 * ```tsx
 * const { viewport, setViewport, updateViewport, resetViewport } = useGraphViewport();
 * updateViewport({ zoom: 2 });
 * console.log(viewport.zoom);
 * ```
 */
export function useGraphViewport() {
  const context = useGraphView();
  return {
    viewport: context.state.viewport,
    setViewport: context.setViewport,
    updateViewport: context.updateViewport,
    resetViewport: context.resetViewport,
  };
}

/**
 * Hook to access tooltip-related actions
 *
 * @returns Object with tooltip action functions and current tooltip state
 * @throws Error if used outside of GraphViewProvider
 *
 * @example
 * ```tsx
 * const { tooltip, showTooltip, hideTooltip } = useGraphViewTooltip();
 * showTooltip({ x: 100, y: 200, content: 'Node info', visible: true });
 * ```
 */
export function useGraphViewTooltip() {
  const context = useGraphView();
  return {
    tooltip: context.state.tooltip,
    showTooltip: context.showTooltip,
    hideTooltip: context.hideTooltip,
  };
}

/**
 * Hook to access loading and error state
 *
 * @returns Object with loading/error state and setter functions
 * @throws Error if used outside of GraphViewProvider
 *
 * @example
 * ```tsx
 * const { isLoading, error, setLoading, setError } = useGraphViewLoading();
 * setLoading(true);
 * ```
 */
export function useGraphViewLoading() {
  const context = useGraphView();
  return {
    isLoading: context.state.isLoading,
    error: context.state.error,
    isAnimating: context.state.isAnimating,
    setLoading: context.setLoading,
    setError: context.setError,
    setAnimating: context.setAnimating,
  };
}

/**
 * Hook to access view configuration
 *
 * @returns Object with view config and update function
 * @throws Error if used outside of GraphViewProvider
 *
 * @example
 * ```tsx
 * const { viewConfig, updateViewConfig } = useGraphViewConfig();
 * updateViewConfig({ showLabels: false });
 * ```
 */
export function useGraphViewConfig() {
  const context = useGraphView();
  return {
    viewConfig: context.state.viewConfig,
    updateViewConfig: context.updateViewConfig,
  };
}

/**
 * Hook to check if a node is selected
 *
 * @param nodeId Node ID to check
 * @returns true if node is selected, false otherwise
 * @throws Error if used outside of GraphViewProvider
 *
 * @example
 * ```tsx
 * const isSelected = useIsNodeSelected('node-1');
 * ```
 */
export function useIsNodeSelected(nodeId: string): boolean {
  const context = useGraphView();
  return context.state.selectedNodes.some((n) => n.nodeId === nodeId);
}

/**
 * Hook to check if a node is hovered
 *
 * @param nodeId Node ID to check
 * @returns true if node is hovered, false otherwise
 * @throws Error if used outside of GraphViewProvider
 *
 * @example
 * ```tsx
 * const isHovered = useIsNodeHovered('node-1');
 * ```
 */
export function useIsNodeHovered(nodeId: string): boolean {
  const context = useGraphView();
  return context.state.hoveredNodeId === nodeId;
}

/**
 * Create a provider context type for type-safe context usage
 * This is used for TypeScript checking during context setup
 */
export type GraphViewContextValue = GraphViewContextType | null;

/**
 * Export factory function to create context provider value
 * Used by GraphViewProvider when creating the context value
 *
 * @param state Current GraphViewState
 * @param dispatch Dispatch function
 * @returns GraphViewContextType object
 */
export function createGraphViewContextValue(
  state: GraphViewState,
  dispatch: (action: GraphViewAction) => void
): GraphViewContextType {
  return {
    state,
    dispatch,
    selectNode: (nodeId: string, type: GraphNode['type']) => {
      dispatch({
        type: 'SELECT_NODE',
        payload: {
          nodeId,
          type,
          selectedAt: Date.now(),
        },
      });
    },
    deselectNode: (nodeId: string) => {
      dispatch({
        type: 'DESELECT_NODE',
        payload: { nodeId },
      });
    },
    clearSelection: () => {
      dispatch({ type: 'CLEAR_SELECTION' });
    },
    hoverNode: (nodeId?: string) => {
      dispatch({
        type: 'HOVER_NODE',
        payload: { nodeId },
      });
    },
    setFilter: (filter: GraphFilter) => {
      dispatch({
        type: 'SET_FILTER',
        payload: filter,
      });
    },
    updateFilter: (filter: Partial<GraphFilter>) => {
      dispatch({
        type: 'UPDATE_FILTER',
        payload: filter,
      });
    },
    clearFilter: () => {
      dispatch({ type: 'CLEAR_FILTER' });
    },
    setViewport: (viewport: GraphViewport) => {
      dispatch({
        type: 'SET_VIEWPORT',
        payload: viewport,
      });
    },
    updateViewport: (viewport: Partial<GraphViewport>) => {
      dispatch({
        type: 'UPDATE_VIEWPORT',
        payload: viewport,
      });
    },
    resetViewport: () => {
      dispatch({ type: 'RESET_VIEWPORT' });
    },
    showTooltip: (tooltip) => {
      dispatch({
        type: 'SHOW_TOOLTIP',
        payload: tooltip,
      });
    },
    hideTooltip: () => {
      dispatch({ type: 'HIDE_TOOLTIP' });
    },
    setLoading: (loading: boolean) => {
      dispatch({
        type: 'SET_LOADING',
        payload: loading,
      });
    },
    setError: (error: string | undefined) => {
      dispatch({
        type: 'SET_ERROR',
        payload: error,
      });
    },
    setAnimating: (animating: boolean) => {
      dispatch({
        type: 'SET_ANIMATING',
        payload: animating,
      });
    },
    updateViewConfig: (config) => {
      dispatch({
        type: 'UPDATE_VIEW_CONFIG',
        payload: config,
      });
    },
    resetState: (partialState?: Partial<GraphViewState>) => {
      dispatch({
        type: 'RESET_STATE',
        payload: partialState,
      });
    },
  };
}

export { createInitialGraphViewState };
