/**
 * Component Registry
 * Maps section types and layouts to component factories
 *
 * Best Practices Applied:
 * - Dynamic imports for code splitting
 * - Next.js compatible lazy loading
 * - Priority-based component resolution
 * - Type-safe component mapping
 */

import type { ComponentType as ReactComponentType } from 'react';

export type ComponentType = 'content' | 'scene' | 'portal' | 'layout';
export type ComponentFactory = () => Promise<{ default: ReactComponentType<unknown> }>;

/**
 * Type-safe wrapper for dynamic imports
 * Ensures consistent module resolution for both default and named exports
 */
function lazyComponent(
  importFn: () => Promise<Record<string, unknown>>
): ComponentFactory {
  return async () => {
    const module = await importFn();
    // Handle both default exports and named exports
    const defaultComponent = module.default || module[Object.keys(module)[0]];
    return {
      default: defaultComponent as ReactComponentType<unknown>,
    };
  };
}

/**
 * Component Registry - Maps IDs to component factories
 */
const registry: Record<ComponentType, Record<string, ComponentFactory>> = {
  // LAYOUT COMPONENTS
  // Layout components not yet implemented
  layout: {},

  // SCENE COMPONENTS (3D)
  scene: {
    'resume': lazyComponent(() => import('@/lib/portfolio/scenes/ResumeScene')),
    'projects': lazyComponent(() => import('@/lib/portfolio/scenes/ProjectsScene')),
    'about': lazyComponent(() => import('@/lib/portfolio/scenes/AboutScene')),
    'overview': lazyComponent(() => import('@/lib/portfolio/scenes/OverviewScene')),
    'personal': lazyComponent(() => import('@/lib/portfolio/scenes/PersonalScene')),
    'default': lazyComponent(() => import('@/lib/portfolio/scene/DefaultScene')),
  },

  // PORTAL COMPONENTS (Overview cards)
  portal: {
    'resume': lazyComponent(() => import('@/lib/portfolio/components/portals/ResumePortal')),
    'projects': lazyComponent(() => import('@/lib/portfolio/components/portals/ProjectsPortal')),
    'about': lazyComponent(() => import('@/lib/portfolio/components/portals/AboutPortal')),
    'default': lazyComponent(() => import('@/lib/portfolio/components/portals/DefaultPortal')),
  },

  // CONTENT COMPONENTS (Overlay/UI)
  content: {
    'resume': lazyComponent(() => import('@/lib/portfolio/components/content/ResumeContent')),
    'projects': lazyComponent(() => import('@/lib/portfolio/components/content/ProjectsContent')),
    'about': lazyComponent(() => import('@/lib/portfolio/components/content/AboutContent')),
    'default': lazyComponent(() => import('@/lib/portfolio/components/content/DefaultContent')),
  },
};

/**
 * Get component factory from registry
 *
 * @param type - Component type (layout, scene, portal, content)
 * @param id - Component ID or page name
 * @param fallback - Fallback ID if not found (defaults to 'default')
 * @returns Component factory for dynamic import
 */
export function getComponentFactory(
  type: ComponentType,
  id: string,
  fallback: string = 'default'
): ComponentFactory {
  const typeRegistry = registry[type];

  // Try exact ID match
  if (typeRegistry[id]) {
    return typeRegistry[id];
  }

  // Try fallback
  if (fallback && typeRegistry[fallback]) {
    return typeRegistry[fallback];
  }

  // Ultimate fallback - return default or throw error
  if (typeRegistry['default']) {
    return typeRegistry['default'];
  }

  // If no default exists, throw descriptive error
  throw new Error(
    `No component found for type "${type}" with id "${id}" and no default fallback exists`
  );
}

/**
 * Register a new component dynamically
 *
 * @param type - Component type
 * @param id - Component ID
 * @param factory - Component factory function
 */
export function registerComponent(
  type: ComponentType,
  id: string,
  factory: ComponentFactory
): void {
  if (!registry[type]) {
    registry[type] = {};
  }
  registry[type][id] = factory;
}

/**
 * Check if a component is registered
 *
 * @param type - Component type
 * @param id - Component ID
 * @returns True if component is registered
 */
export function hasComponent(type: ComponentType, id: string): boolean {
  return !!registry[type]?.[id];
}

/**
 * Get all registered component IDs for a type
 *
 * @param type - Component type
 * @returns Array of registered component IDs
 */
export function getRegisteredComponents(type: ComponentType): string[] {
  return Object.keys(registry[type] || {});
}

/**
 * Preload a component
 * Useful for prefetching critical components
 *
 * @param type - Component type
 * @param id - Component ID
 */
export async function preloadComponent(
  type: ComponentType,
  id: string
): Promise<void> {
  try {
    const factory = getComponentFactory(type, id);
    await factory();
  } catch (error) {
    console.warn(`Failed to preload component ${type}:${id}`, error);
  }
}

/**
 * Batch preload components
 *
 * @param components - Array of [type, id] tuples to preload
 */
export async function preloadComponents(
  components: Array<[ComponentType, string]>
): Promise<void> {
  await Promise.all(
    components.map(([type, id]) => preloadComponent(type, id))
  );
}
