/**
 * Component Registry System
 *
 * Provides runtime access to the auto-generated component registry.
 * Used by the showcase page and development tools to discover and catalog components.
 */

import type { ComponentMetadata, ComponentRegistry, ComponentCategory, ThreeDSubcategory, ArchitectureLayer } from './types';

/**
 * Lazy-loaded registry instance
 * In production, this will be empty. In development, it's populated by the registry generator.
 */
let cachedRegistry: ComponentRegistry | null = null;

/**
 * Load the component registry from the generated JSON file
 * Only works in development or when explicitly enabled
 */
export async function loadComponentRegistry(): Promise<ComponentRegistry> {
  // Return cached registry if already loaded
  if (cachedRegistry) {
    return cachedRegistry;
  }

  // In production, return empty registry
  if (process.env.NODE_ENV === 'production') {
    return getEmptyRegistry();
  }

  try {
    // Load the auto-generated registry
    const response = await fetch('/registry/components.json');
    if (!response.ok) {
      console.warn('Failed to load component registry');
      return getEmptyRegistry();
    }
    cachedRegistry = (await response.json()) as ComponentRegistry;
    return cachedRegistry;
  } catch (error) {
    console.warn('Error loading component registry:', error);
    return getEmptyRegistry();
  }
}

/**
 * Get cached registry without loading
 * Returns empty registry if not loaded yet
 */
export function getCachedRegistry(): ComponentRegistry {
  return cachedRegistry || getEmptyRegistry();
}

/**
 * Clear the registry cache
 * Useful for testing or reloading
 */
export function clearRegistryCache(): void {
  cachedRegistry = null;
}

/**
 * Get an empty registry structure
 * Used as fallback when registry is not available
 */
export function getEmptyRegistry(): ComponentRegistry {
  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalComponents: 0,
    byCategory: {
      ui: [],
      composite: [],
      dashboard: [],
      editor: [],
      '3d-dashboard': [],
      layout: [],
      scene: [],
      model: [],
      hook: [],
      utility: []
    },
    byId: {},
    stats: {
      countByCategory: {
        ui: 0,
        composite: 0,
        dashboard: 0,
        editor: 0,
        '3d-dashboard': 0,
        layout: 0,
        scene: 0,
        model: 0,
        hook: 0,
        utility: 0
      },
      countByLayer: {
        1: 0,
        2: 0,
        3: 0,
        none: 0
      },
      countBySubcategory: {
        lighting: 0,
        camera: 0,
        materials: 0,
        animations: 0,
        physics: 0,
        interactions: 0,
        effects: 0,
        optimization: 0
      },
      commonDependencies: []
    }
  };
}

/**
 * Find components by category
 */
export function getComponentsByCategory(category: ComponentCategory): ComponentMetadata[] {
  const registry = getCachedRegistry();
  return registry.byCategory[category] || [];
}

/**
 * Find components by layer (1, 2, or 3)
 */
export function getComponentsByLayer(layer: ArchitectureLayer): ComponentMetadata[] {
  const registry = getCachedRegistry();
  return Object.values(registry.byId).filter(component => component.layer === layer);
}

/**
 * Find 3D components by subcategory
 * Examples: lighting, camera, animations, physics, etc.
 */
export function getComponentsBySubcategory(subcategory: ThreeDSubcategory): ComponentMetadata[] {
  const registry = getCachedRegistry();
  return Object.values(registry.byId).filter(component => component.subcategory === subcategory);
}

/**
 * Get a single component by ID
 */
export function getComponentById(id: string): ComponentMetadata | undefined {
  const registry = getCachedRegistry();
  return registry.byId[id];
}

/**
 * Search components by name (case-insensitive substring match)
 */
export function searchComponents(query: string): ComponentMetadata[] {
  const registry = getCachedRegistry();
  const lowerQuery = query.toLowerCase();

  return Object.values(registry.byId).filter(component => {
    return (
      component.name.toLowerCase().includes(lowerQuery) ||
      component.description?.toLowerCase().includes(lowerQuery) ||
      component.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      component.exports.some(exp => exp.name.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Get all components in a specific directory pattern
 * Example: 'components/ui' returns all UI layer components
 */
export function getComponentsByPath(pathPattern: string): ComponentMetadata[] {
  const registry = getCachedRegistry();
  const normalized = pathPattern.replace(/\\/g, '/');

  return Object.values(registry.byId).filter(component => {
    return component.path.includes(normalized);
  });
}

/**
 * Get components with specific tag(s)
 */
export function getComponentsByTag(tag: string | string[]): ComponentMetadata[] {
  const registry = getCachedRegistry();
  const tags = Array.isArray(tag) ? tag : [tag];
  const lowerTags = tags.map(t => t.toLowerCase());

  return Object.values(registry.byId).filter(component => {
    return component.tags?.some(t => lowerTags.includes(t.toLowerCase()));
  });
}

/**
 * Get related components
 * Based on category, layer, or explicit relationships
 */
export function getRelatedComponents(componentId: string): ComponentMetadata[] {
  const registry = getCachedRegistry();
  const component = registry.byId[componentId];

  if (!component) {
    return [];
  }

  const related = new Set<string>();

  // Add components in same category
  if (component.category) {
    registry.byCategory[component.category].forEach(c => {
      if (c.id !== componentId) {
        related.add(c.id);
      }
    });
  }

  // Add components in same layer
  if (component.layer) {
    Object.values(registry.byId).forEach(c => {
      if (c.layer === component.layer && c.id !== componentId) {
        related.add(c.id);
      }
    });
  }

  // Add explicitly related components
  if (component.relatedComponents) {
    component.relatedComponents.forEach(id => related.add(id));
  }

  return Array.from(related)
    .map(id => registry.byId[id])
    .filter(Boolean);
}

/**
 * Get registry statistics
 */
export function getRegistryStats() {
  const registry = getCachedRegistry();
  return registry.stats;
}

/**
 * Get components that depend on a specific module
 */
export function getComponentsDependingOn(moduleName: string): ComponentMetadata[] {
  const registry = getCachedRegistry();

  return Object.values(registry.byId).filter(component => {
    return component.dependencies?.some(dep => dep.name === moduleName);
  });
}

/**
 * Validate component registry integrity
 * Checks for broken references, missing exports, etc.
 */
export function validateRegistry(): { valid: boolean; errors: string[] } {
  const registry = getCachedRegistry();
  const errors: string[] = [];

  // Check byId consistency
  Object.entries(registry.byId).forEach(([id, component]) => {
    if (component.id !== id) {
      errors.push(`Component ID mismatch: ${id} !== ${component.id}`);
    }
  });

  // Check byCategory consistency
  Object.entries(registry.byCategory).forEach(([category, components]) => {
    components.forEach(component => {
      if (component.category !== category as ComponentCategory) {
        errors.push(`Component ${component.id} in wrong category: ${category}`);
      }
    });
  });

  // Check related components exist
  Object.values(registry.byId).forEach(component => {
    component.relatedComponents?.forEach(relatedId => {
      if (!registry.byId[relatedId]) {
        errors.push(`Component ${component.id} references non-existent related component: ${relatedId}`);
      }
    });
  });

  // Check internal dependencies exist
  Object.values(registry.byId).forEach(component => {
    component.dependencies?.forEach(dep => {
      if (dep.isInternal && dep.internalPath) {
        // Note: We can't fully validate internal paths without file system access
        // This is mainly for documentation purposes
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Export registry data as JSON
 * Useful for external tools, documentation generation, etc.
 */
export function exportRegistryJSON(): string {
  const registry = getCachedRegistry();
  return JSON.stringify(registry, null, 2);
}

/**
 * Export registry as markdown
 * Generates a component catalog in markdown format
 */
export function exportRegistryMarkdown(): string {
  const registry = getCachedRegistry();
  let markdown = '# Component Registry\n\n';
  markdown += `Generated: ${registry.generatedAt}\n`;
  markdown += `Total Components: ${registry.totalComponents}\n\n`;

  // Statistics section
  markdown += '## Statistics\n\n';
  markdown += '### By Category\n';
  Object.entries(registry.stats.countByCategory).forEach(([category, count]) => {
    if (count > 0) {
      markdown += `- **${category}**: ${count} components\n`;
    }
  });

  markdown += '\n### By Layer\n';
  Object.entries(registry.stats.countByLayer).forEach(([layer, count]) => {
    if (count > 0 && layer !== 'none') {
      markdown += `- **Layer ${layer}**: ${count} components\n`;
    }
  });

  // Components by category
  Object.entries(registry.byCategory).forEach(([category, components]) => {
    if (components.length > 0) {
      markdown += `\n## ${category.charAt(0).toUpperCase() + category.slice(1)} Components\n\n`;

      components.forEach(component => {
        markdown += `### ${component.name}\n`;
        markdown += `- **Path**: \`${component.path}\`\n`;
        markdown += `- **ID**: \`${component.id}\`\n`;
        if (component.layer) {
          markdown += `- **Layer**: ${component.layer}\n`;
        }
        if (component.description) {
          markdown += `- **Description**: ${component.description}\n`;
        }
        if (component.exports.length > 0) {
          markdown += `- **Exports**: ${component.exports.map(e => `\`${e.name}\``).join(', ')}\n`;
        }
        markdown += '\n';
      });
    }
  });

  return markdown;
}

/**
 * Get components sorted by usage (most dependencies count)
 */
export function getComponentsSortedByDependency(descending = true): ComponentMetadata[] {
  const registry = getCachedRegistry();
  const components = Object.values(registry.byId);

  return components.sort((a, b) => {
    const aCount = a.dependencies?.length || 0;
    const bCount = b.dependencies?.length || 0;
    return descending ? bCount - aCount : aCount - bCount;
  });
}

/**
 * Get the most commonly imported modules
 */
export function getCommonDependencies(limit = 20): Array<{ name: string; count: number }> {
  const registry = getCachedRegistry();
  return registry.stats.commonDependencies.slice(0, limit);
}

// Development-only debugging function
export function debugRegistry(): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const registry = getCachedRegistry();
  console.group('📦 Component Registry Debug');
  console.log('Total components:', registry.totalComponents);
  console.log('Categories:', registry.stats.countByCategory);
  console.log('Layers:', registry.stats.countByLayer);
  console.log('Subcategories:', registry.stats.countBySubcategory);
  console.log('Validation:', validateRegistry());
  console.groupEnd();
}
