/**
 * Component Resolver Utility
 * Resolves components for sections using priority order
 *
 * Priority Order:
 * 1. Explicit component path from section config
 * 2. Component registry ID from section config
 * 3. Auto-discovery pattern (page-layoutType)
 * 4. Page-based fallback
 * 5. Default fallback
 *
 * Best Practices Applied:
 * - Next.js compatible dynamic imports
 * - Type-safe component resolution
 * - Graceful fallbacks
 * - SSR-safe
 */

import {
  ComponentFactory,
  ComponentType,
  getComponentFactory,
  hasComponent,
} from '../config/component-registry';
import { Section } from '../config/sections.types';

/**
 * Resolve component factory for a section
 *
 * @param type - Component type (layout, scene, portal, content)
 * @param section - Section configuration
 * @returns Component factory for dynamic import
 *
 * @example
 * ```ts
 * const factory = resolveComponent('scene', section);
 * const Component = await factory();
 * ```
 */
export function resolveComponent(
  type: ComponentType,
  section: Section
): ComponentFactory {
  const rendering = section.rendering;
  const layout = section.layout;

  // Priority 1: Explicit component path
  if (type === 'content' && rendering?.contentComponent) {
    return () => import(rendering.contentComponent!);
  }
  if (type === 'scene' && rendering?.sceneComponent) {
    return () => import(rendering.sceneComponent!);
  }
  if (type === 'portal' && rendering?.portalComponent) {
    return () => import(rendering.portalComponent!);
  }
  if (type === 'layout' && layout?.component) {
    return () => import(layout.component!);
  }

  // Priority 2: Component registry ID
  if (type === 'content' && rendering?.contentId) {
    return getComponentFactory('content', rendering.contentId);
  }
  if (type === 'scene' && rendering?.sceneId) {
    return getComponentFactory('scene', rendering.sceneId);
  }
  if (type === 'portal' && rendering?.portalId) {
    return getComponentFactory('portal', rendering.portalId);
  }
  if (type === 'layout' && layout?.type) {
    return getComponentFactory('layout', layout.type);
  }

  // Priority 3: Auto-discovery pattern {page}-{layout.type}
  if (layout?.type) {
    const autoId = `${section.page}-${layout.type}`;
    if (hasComponent(type, autoId)) {
      return getComponentFactory(type, autoId);
    }
  }

  // Priority 4: Page-based fallback
  if (hasComponent(type, section.page)) {
    return getComponentFactory(type, section.page);
  }

  // Priority 5: Default fallback
  return getComponentFactory(type, 'default');
}

/**
 * Generate drilldown path for a section
 *
 * @param section - Section configuration
 * @returns Path string or null if drilldown not enabled
 *
 * @example
 * ```ts
 * const path = getDrilldownPath(section);
 * // Returns: "/projects/project-1"
 * ```
 */
export function getDrilldownPath(section: Section): string | null {
  if (!section.drilldown?.enabled) {
    return null;
  }

  // Use custom path if provided
  if (section.drilldown.path) {
    return section.drilldown.path;
  }

  // Use section path if provided
  if (section.path) {
    return section.path;
  }

  // Auto-generate: /{page}/{id}
  return `/${section.page}/${section.id}`;
}

/**
 * Check if section has 3D scene
 *
 * @param section - Section configuration
 * @returns True if section has scene configuration
 */
export function hasScene(section: Section): boolean {
  return !!(
    section.scene ||
    section.rendering?.sceneComponent ||
    section.rendering?.sceneId
  );
}

/**
 * Check if section has drilldown
 *
 * @param section - Section configuration
 * @returns True if drilldown is enabled
 */
export function hasDrilldown(section: Section): boolean {
  return section.drilldown?.enabled === true;
}

/**
 * Get all child sections (for hierarchical navigation)
 *
 * @param section - Parent section
 * @returns Array of child sections
 */
export function getChildSections(section: Section): Section[] {
  return section.children || section.drilldown?.sections || [];
}
