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
  KnowledgeGraphSection,
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

export {
  // ForceDirectedGraphView
  ForceDirectedGraphView,
  type ForceDirectedGraphViewProps,
  type ForceDirectedGraphViewConfig,
} from './lib/graph-views/force-graph-view/index';

export {
  // GlobeView
  GlobeView,
  type GlobeViewProps,
} from './lib/graph-views/globe-view/index';

export {
  // LayeredUniverseView
  LayeredUniverseView,
  type LayeredUniverseViewProps,
  type LayeredUniverseViewConfig,
} from './lib/graph-views/layered-universe-view/index';

// Grid utilities
export {
  useGridLayout,
  generateGridMediaQuery,
  type GridLayoutStyles,
  RESPONSIVE_BREAKPOINTS,
} from './lib/graph-views/entry-grid-view/useGridLayout';

// Core graph type helpers
export {
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
