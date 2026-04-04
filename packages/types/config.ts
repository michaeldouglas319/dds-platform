/**
 * App Config Types
 *
 * Schema for complete config-driven applications.
 * Supports multi-page apps with navigation, routing, and theming.
 *
 * @module @dds/types/config
 */

import type { UniversalSection } from './section';

export interface AppConfig {
  app: AppMetadata;
  navigation: NavigationConfig;
  pages: PageConfig[];
  theme?: ThemeConfig;
  features?: FeatureFlags;
}

export interface AppMetadata {
  name: string;
  label?: string;
  description?: string;
  baseUrl?: string;
  defaultTheme?: 'light' | 'dark';
  favicon?: string;
  ogImage?: string;
  sector?: string;
}

export interface FeatureFlags {
  chat?: boolean;
  commerce?: boolean;
  docs?: boolean;
  blog?: boolean;
  gallery?: boolean;
  pageBuilder?: boolean;
  cms?: boolean;
  apiDocs?: boolean;
  codeDemos?: boolean;
  i18n?: boolean;
  generativeUI?: boolean;
  [key: string]: boolean | undefined;
}

export interface NavigationConfig {
  items: NavItem[];
  logo?: {
    src: string;
    alt: string;
    href?: string;
  };
  position?: 'top' | 'side';
  sticky?: boolean;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  accessRoles?: string[];
  requireAuth?: boolean;
  children?: NavItem[];
  external?: boolean;
}

export interface PageConfig {
  id: string;
  path: string;
  meta: PageMetadata;
  sections: UniversalSection[];
  layout?: 'default' | 'full-width' | 'centered';
  accessRoles?: string[];
  requireAuth?: boolean;
}

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

export interface ThemeConfig {
  primary?: string;
  accent?: string;
  background?: string;
  text?: string;
  customVars?: Record<string, string>;
}

export function isAppConfig(config: unknown): config is AppConfig {
  if (!config || typeof config !== 'object') return false;
  const c = config as Record<string, unknown>;
  return (
    typeof c.app === 'object' &&
    typeof c.navigation === 'object' &&
    Array.isArray(c.pages)
  );
}
