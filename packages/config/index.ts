/**
 * @dds/config — App configuration providers and utilities
 *
 * Re-exports config system from @dds/renderer for convenience.
 * Apps can import from either @dds/config or @dds/renderer/config.
 */

// Types
export { isAppConfig } from '@dds/types';
export type {
  AppConfig,
  AppMetadata,
  FeatureFlags,
  NavigationConfig,
  NavItem,
  PageConfig,
  PageMetadata,
  ThemeConfig,
} from '@dds/types';

// Re-export renderer config components
export {
  AppConfigProvider,
  useAppConfig,
  useCurrentPage,
  useNavigation,
  useFeatureFlag,
  ConfigPage,
  ConfigNavigation,
} from '@dds/renderer/config';
