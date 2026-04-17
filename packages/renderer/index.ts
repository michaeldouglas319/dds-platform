/**
 * @dds/renderer — Config-driven section rendering for the DDS platform
 */

// Batch renderer
export { SectionBatchRenderer, type SectionBatchRendererProps } from './batch-renderer';

// Theme
export { ThemeProvider, useTheme, type ThemeProviderProps } from './theme/index';

// Registry
export { createRegistry, defaultRegistry } from './registry';

// Individual renderers
export {
  HeroRenderer,
  TextRenderer,
  StatsRenderer,
  FeatureMatrixRenderer,
  TimelineRenderer,
  CTARenderer,
  TwoColumnRenderer,
  SectorsGridRenderer,
  EntryHighlightRenderer,
  EntryGridRenderer,
} from './renderers';

// Config (re-export everything)
export {
  AppConfigProvider,
  useAppConfig,
  useCurrentPage,
  useNavigation,
  useFeatureFlag,
  ConfigPage,
  ConfigNavigation,
  type AppConfigProviderProps,
  type ConfigPageProps,
  type ConfigNavigationProps,
} from './config/index';

// Graph utilities (types, context, hooks, reducer)
export {
  // Types
  type GraphNode,
  type GraphEdge,
  type GraphData,
  type UnifiedGraphSection,
  type SelectedNode,
  type GraphFilter,
  type FilteredGraphData,
  type GraphViewport,
  type GraphTooltip,
  type GraphViewState,
  type GraphViewAction,
  type GraphViewContextType,
  type GraphViewContextValue,
  // Context and Hooks
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
  createInitialGraphViewState,
  // Reducer
  graphViewReducer,
} from './lib/graph-utils';

// Graph views
export {
  // EntryGridView
  EntryGridView,
  type EntryGridViewProps,
  type EntryGridViewConfig,
} from './lib/graph-views/entry-grid-view/index';

// ForceDirectedGraphView - TODO: implement in Task #17
// export {
//   ForceDirectedGraphView,
//   type ForceDirectedGraphViewProps,
//   type ForceDirectedGraphViewConfig,
// } from './lib/graph-views/force-graph-view/index';

// GlobeView - TODO: implement in Task #15
// export {
//   GlobeView,
//   type GlobeViewProps,
//   type GlobeViewConfig,
// } from './lib/graph-views/globe-view/index';

// Grid utilities
export {
  useGridLayout,
  generateGridMediaQuery,
  type GridLayoutStyles,
  RESPONSIVE_BREAKPOINTS,
} from './lib/graph-views/entry-grid-view/useGridLayout';

// Core graph types
export {
  type KnowledgeGraphSection,
  isKnowledgeGraphSection,
  hasGraphData,
  getGraphData,
  shouldRenderGraph,
} from './core/types';

// Graph UI Components
export {
  // View Switcher
  ViewSwitcher,
  type ViewSwitcherProps,
  type ViewType,
  // Filter Panel
  FilterPanel,
  type FilterPanelProps,
  // Loading Spinner
  GraphLoadingSpinner,
  type GraphLoadingSpinnerProps,
} from './lib/components';
