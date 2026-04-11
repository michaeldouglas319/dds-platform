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
  WikiTocRenderer,
  resolveTocItems,
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
