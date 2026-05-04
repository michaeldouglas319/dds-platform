/**
 * Component Registry System
 * Maps component IDs to lazy-loaded component factories
 * Enables auto-discovery and extensibility without code changes
 */

import { ComponentType } from 'react';

export type ComponentFactory = () => Promise<{ default: ComponentType<unknown> }>;

export interface ComponentRegistry {
  content: Record<string, ComponentFactory>;
  scene: Record<string, ComponentFactory>;
  portal: Record<string, ComponentFactory>;
  layout: Record<string, ComponentFactory>;
}

/**
 * Type-safe wrapper for dynamic imports
 * Handles both default and named exports consistently
 */
function lazyComponent(
  importFn: () => Promise<Record<string, unknown>>
): ComponentFactory {
  return async () => {
    const module = await importFn();
    // Return the default export if it exists, otherwise return the first exported component
    const defaultComponent = module.default || Object.values(module).find((v) => typeof v === 'function');
    return {
      default: defaultComponent as ComponentType<unknown>,
    };
  };
}

/**
 * Component Registry
 * Auto-discovery pattern: {page}-{layout.type} maps to components
 * 
 * To add new components:
 * 1. Create component file following naming convention
 * 2. Add entry here (or use auto-discovery)
 * 3. Reference by ID in section config
 */
export const componentRegistry: ComponentRegistry = {
  content: {
    // Default content renderer
    'default': lazyComponent(() => import('@/lib/portfolio/components/content/DefaultContent')),

    // Page-specific content components
    // Note: UAV and Ideas components have been removed - using default as fallback
    'pitch-deck': lazyComponent(() => import('@/lib/portfolio/components/content/DefaultContent')),
    'resume': lazyComponent(() => import('@/app/resumev3/components/ResumeContent')),
    'business': lazyComponent(() => import('@/app/business/components/BusinessOverviewContent')),
    'ideas': lazyComponent(() => import('@/lib/portfolio/components/content/DefaultContent')),

    // Auto-discovery patterns (will be resolved dynamically)
    'uav-scroll-based': lazyComponent(() => import('@/lib/portfolio/components/content/DefaultContent')),
    'business-scroll-based': lazyComponent(() => import('@/app/business/components/BusinessOverviewContent')),
    'ideas-scroll-based': lazyComponent(() => import('@/lib/portfolio/components/content/DefaultContent')),
  },

  scene: {
    // Default scene renderer
    'default': lazyComponent(() => import('@/lib/portfolio/scene/DefaultScene')),

    // Page-specific scene components
    // Note: UAV and Ideas scene components have been removed - using default as fallback
    'scroll-based': lazyComponent(() => import('@/lib/portfolio/scene/DefaultScene')),
    'resume-scroll': lazyComponent(() => import('@/app/resumev3/scene/components/ScrollBasedResumeScene')),
    'business-overview': lazyComponent(() => import('@/app/business/scene/BusinessOverviewScene')),
    'ideas-overview': lazyComponent(() => import('@/lib/portfolio/scene/DefaultScene')),

    // Auto-discovery patterns
    'uav-scroll-based': lazyComponent(() => import('@/lib/portfolio/scene/DefaultScene')),
    'business-scroll-based': lazyComponent(() => import('@/app/business/scene/BusinessOverviewScene')),
    'ideas-scroll-based': lazyComponent(() => import('@/lib/portfolio/scene/DefaultScene')),
  },

  portal: {
    // Default portal renderer
    'default': lazyComponent(() => import('@/lib/portfolio/components/portals/DefaultPortal')),

    // Page-specific portal components
    // Note: UAV components have been removed - using default as fallback
    'uav-drone': lazyComponent(() => import('@/lib/portfolio/components/portals/DefaultPortal')),
    'resume-neural': lazyComponent(() => import('@/app/resumev3/scene/ResumeV3ScenePortal')),

    // Auto-discovery patterns
    'uav': lazyComponent(() => import('@/lib/portfolio/components/portals/DefaultPortal')),
    'business': lazyComponent(() => import('@/lib/portfolio/components/portals/DefaultPortal')),
    'ideas': lazyComponent(() => import('@/lib/portfolio/components/portals/DefaultPortal')),
  },
  
  layout: {
    // Default layout renderer - Note: Layout components don't exist yet, these are placeholders
    // 'default': () => import('../layouts/ScrollBasedLayout').then(m => ({ default: m.ScrollBasedLayout })),

    // Layout type components - Placeholders for future implementation
    // 'scroll-based': () => import('../layouts/ScrollBasedLayout').then(m => ({ default: m.ScrollBasedLayout })),
    // 'grid': () => import('../layouts/GridLayout').then(m => ({ default: m.GridLayout })),
    // 'carousel': () => import('../layouts/CarouselLayout').then(m => ({ default: m.CarouselLayout })),

    // Page-specific layouts - Using actual existing layout components
    // Note: UAV and Ideas layouts have been removed - using business layout as fallback
    'uav': () => import('@/app/business/layout/BusinessLayout').then(m => ({ default: m.default })),
    'business': () => import('@/app/business/layout/BusinessLayout').then(m => ({ default: m.default })),
    'ideas': () => import('@/app/business/layout/BusinessLayout').then(m => ({ default: m.default })),
    'resume': () => import('@/app/resumev3/layout/ResumeV3Layout').then(m => ({ default: m.default })),

    // Default fallback to business layout
    'default': () => import('@/app/business/layout/BusinessLayout').then(m => ({ default: m.default })),
    'scroll-based': () => import('@/app/business/layout/BusinessLayout').then(m => ({ default: m.default })),
  },
};

/**
 * Helper to get component factory with fallback
 */
export function getComponentFactory(
  type: keyof ComponentRegistry,
  id: string | undefined,
  fallbackId: string = 'default'
): ComponentFactory {
  const registry = componentRegistry[type];
  if (id && registry[id]) {
    return registry[id];
  }
  return registry[fallbackId] || registry['default'];
}

