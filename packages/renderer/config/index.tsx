'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type {
  AppConfig,
  NavigationConfig,
  PageConfig,
  UniversalSection,
  RendererRegistry,
} from '@dds/types';

// ─── Context ─────────────────────────────────────────────────────

const AppConfigContext = createContext<AppConfig | null>(null);

export interface AppConfigProviderProps {
  config: AppConfig;
  children: ReactNode;
}

export function AppConfigProvider({ config, children }: AppConfigProviderProps) {
  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
}

// ─── Hooks ───────────────────────────────────────────────────────

export function useAppConfig(): AppConfig {
  const ctx = useContext(AppConfigContext);
  if (!ctx) {
    throw new Error('useAppConfig must be used within an <AppConfigProvider>');
  }
  return ctx;
}

export function useCurrentPage(path: string): PageConfig | undefined {
  const config = useAppConfig();
  return useMemo(
    () => config.pages.find((p) => p.path === path),
    [config.pages, path],
  );
}

export function useNavigation(): NavigationConfig {
  const config = useAppConfig();
  return config.navigation;
}

export function useFeatureFlag(flag: string): boolean {
  const config = useAppConfig();
  return config.features?.[flag] ?? false;
}

// ─── ConfigPage ──────────────────────────────────────────────────

export interface ConfigPageProps {
  path: string;
  registry: RendererRegistry;
  fallback?: ReactNode;
}

/**
 * Renders every section for a given page path.
 * Uses the registry to look up a renderer by `display.layout` or `section.type`.
 */
export function ConfigPage({ path, registry, fallback }: ConfigPageProps) {
  const page = useCurrentPage(path);
  const config = useAppConfig();

  if (!page) {
    return <>{fallback ?? <div className="p-8 text-center text-neutral-500">Page not found: {path}</div>}</>;
  }

  return (
    <>
      {page.sections.map((section) => {
        // visibility gate
        if (section.display?.visible === false) return null;

        // feature flag gate
        const flag = section.display?.featureFlag;
        if (flag && !(config.features?.[flag] ?? false)) return null;

        const key = section.display?.layout ?? section.type;
        const entry = registry[key];

        if (entry) {
          const Component = entry.component;
          return <Component key={section.id} section={section} />;
        }

        return (
          <div key={section.id} className="p-4 text-sm text-neutral-500">
            No renderer for: {section.name ?? section.id}
          </div>
        );
      })}
    </>
  );
}

// ─── ConfigNavigation ────────────────────────────────────────────

export interface ConfigNavigationProps {
  className?: string;
  renderItem?: (item: { label: string; path: string; external?: boolean }) => ReactNode;
}

export function ConfigNavigation({ className, renderItem }: ConfigNavigationProps) {
  const nav = useNavigation();

  const defaultRenderItem = (item: { label: string; path: string; external?: boolean }) => (
    <a
      key={item.path}
      href={item.path}
      className="text-sm font-medium text-neutral-300 transition-colors hover:text-white"
      {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {item.label}
    </a>
  );

  const render = renderItem ?? defaultRenderItem;

  return (
    <nav className={className ?? 'flex items-center gap-6'}>
      {nav.items.map((item) => render(item))}
    </nav>
  );
}
