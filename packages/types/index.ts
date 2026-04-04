/**
 * @dds/types — Shared type definitions for the DDS platform
 *
 * Pure types with zero runtime code (except isAppConfig type guard).
 * Every app and package imports from here.
 */

export type {
  // Theme
  Theme,
  // Images
  ImageSource,
  ImageWithDimensions,
  ThemedImage,
  SidebarImage,
  // Content
  Citation,
  Paragraph,
  Highlight,
  Stat,
  // Section buckets
  Subject,
  Content,
  Media,
  Link,
  Links,
  Display,
  Spatial,
  Landing,
  // Core
  UniversalSection,
  // Renderer
  RendererProps,
  RendererComponent,
  RendererMetadata,
  RendererEntry,
  RendererRegistry,
} from './section';

export type {
  AppConfig,
  AppMetadata,
  FeatureFlags,
  NavigationConfig,
  NavItem,
  PageConfig,
  PageMetadata,
  ThemeConfig,
} from './config';

export { isAppConfig } from './config';
