/**
 * Graph Utils Index
 *
 * Central export file for all knowledge graph utilities, types, and hooks.
 * Import from '@dds/renderer/lib/graph-utils' to access everything.
 *
 * @module @dds/renderer/lib/graph-utils
 */

// ─── Types ────────────────────────────────────────────────────────
export type {
  GraphNode,
  GraphEdge,
  GraphData,
  UnifiedGraphSection,
  SelectedNode,
  GraphFilter,
  FilteredGraphData,
  GraphViewport,
  GraphTooltip,
  GraphViewState,
  GraphViewAction,
  GraphViewContextType,
} from './types';

// ─── Reducer ──────────────────────────────────────────────────────
export { graphViewReducer, createInitialGraphViewState } from './reducer';

// ─── Context and Hooks ────────────────────────────────────────────
export {
  GraphViewContext,
  useGraphView,
  useGraphViewState,
  useGraphViewDispatch,
  useGraphViewSelection,
  useGraphViewFilter,
  useGraphViewport,
  useGraphViewTooltip,
  useGraphViewLoading,
  useGraphViewConfig,
  useIsNodeSelected,
  useIsNodeHovered,
  createGraphViewContextValue,
} from './context';

export type { GraphViewContextValue } from './context';

// ─── Viewport Utilities ────────────────────────────────────────────
export {
  createViewportConfig,
  calculateForcedirectedCamera,
  calculateLayeredUniverseCamera,
  calculateGlobeCamera,
  calculateGridCamera,
  calculateCameraPosition,
  zoomToNode,
  zoomToSelection,
  resetViewport,
  calculateGraphBounds,
  clampZoom,
  lerpViewport,
} from './viewport';

export type {
  ViewportConfig,
  CameraConfig,
  GraphBounds,
} from './viewport';

// ─── Filtering Utilities ───────────────────────────────────────────
export {
  nodeMatchesFilter,
  filterNodes,
  filterEdges,
  applyGraphFilter,
  calculateSearchRelevance,
  searchNodes,
  buildFilter,
  FilterBuilder,
  isFilterEmpty,
  mergeFilters,
} from './filtering';

// ─── Selection & Path Highlighting ─────────────────────────────────
export {
  findRelatedNodes,
  highlightConnectedComponent,
  findShortestPath,
  findEdgesBetweenNodes,
  findBridgeEdges,
  findBoundaryNodes,
  extractSubgraph,
  calculateDegreeCentrality,
  calculateBetweennessCentrality,
  findMostCentralNode,
} from './selection';

export type {
  RelatedNodesResult,
  ConnectedComponentResult,
} from './selection';

// ─── Interaction & Tooltip Utilities ────────────────────────────────
export {
  getNodeTooltipContent,
  getEdgeTooltipContent,
  formatTooltipText,
  calculateTooltipPosition,
  isPointNearNode,
  scheduleTooltipShow,
  createTooltipDebounce,
  hasHeldLongEnough,
  GraphTooltip,
  handleGraphKeyDown,
  getHighlightAnimationName,
  getSelectionAnimationStyle,
  getNodeAriaLabel,
  getEdgeAriaLabel,
} from './interaction.tsx';

export type {
  HoverState,
  GraphTooltipComponentProps,
} from './interaction.tsx';

// ─── Debounce Utilities ────────────────────────────────────────────
export {
  useDebounce,
  useDebouncedCallback,
} from './useDebounce';

// ─── Keyboard Navigation Utilities ────────────────────────────────
export {
  handleKeyboardNavigation,
  getGridPosition,
  getIndexFromGridPosition,
  handleGridKeyboardNavigation,
  generateAriaLabel,
} from './keyboard-nav';
