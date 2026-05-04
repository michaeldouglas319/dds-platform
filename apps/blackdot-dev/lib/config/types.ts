/**
 * Core Configuration Type Definitions
 *
 * This file provides type-safe definitions for all configuration structures
 * across the application. Used for both static configs and future DB-backed configs.
 *
 * @see /CLAUDE.md for config architecture documentation
 */

/**
 * Vector3D - Represents 3D coordinate (x, y, z)
 */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * ModelTransform - 3D model transformation configuration
 */
export interface ModelTransform {
  position: Vector3D;
  rotation: Vector3D;
  scale?: Vector3D;
}

/**
 * SharedModelConfig - Configuration for a single 3D model
 * Used for models in aerosim, particle-simulator, and other 3D scenes
 */
export interface SharedModelConfig {
  targetSize: number;
  position: Vector3D;
  rotation: Vector3D;
  scale?: Vector3D;
  dynamic_source_area?: boolean;
  description?: string;
}

/**
 * SharedModelRegistry - Registry of all shared 3D models
 * Single source of truth for model configurations
 */
export interface SharedModelRegistry {
  models: Record<string, SharedModelConfig>;
  defaults: SharedModelConfig;
}

/**
 * ConfigKey - Union type of all available configuration keys
 * Used for type-safe useConfig hook
 *
 * @example
 * ```typescript
 * const config = useConfig('design.tokens')  // Full autocomplete
 * const resume = useConfig('content.resume')
 * const models = useConfig('models.shared')
 * ```
 */
export type ConfigKey =
  // Design System
  | 'design.tokens'
  | 'design.views'
  // Navigation
  | 'navigation.config'
  | 'navigation.routes'
  | 'navigation.routeMetadata'
  // Content
  | 'content.resume'
  | 'content.business'
  | 'content.ideas'
  | 'content.sections'
  | 'content.sections.resume'
  // Models
  | 'models.shared'
  | 'models.resume'
  | 'models.ideas'
  // Annotations
  | 'annotations.business'
  | 'annotations.ideas'
  // Particles
  | 'particles.config'
  | 'particles.network'
  | 'particles.colors'
  // Expertise
  | 'expertise.faa'
  | 'expertise.composites'
  | 'expertise.umbrella'
  // Verticals
  | 'verticals.manufacturing'
  | 'verticals.surveillance';

/**
 * ConfigMap - Maps ConfigKey to its configuration type
 * Provides type-safe access to all configurations
 *
 * This interface should be updated whenever a new configuration is added
 */
export interface ConfigMap {
  // Design System
  'design.tokens': unknown; // SPACING_TOKENS | other design tokens
  'design.views': unknown; // VIEW_PRESETS
  // Navigation
  'navigation.config': unknown; // navigation config object
  'navigation.routes': unknown; // routes array or object
  'navigation.routeMetadata': unknown; // metadata mapping
  // Content
  'content.resume': unknown; // resumeJobs array
  'content.business': unknown; // businessSections array
  'content.ideas': unknown; // ideasSections array
  'content.sections': unknown; // sections config
  'content.sections.resume': unknown; // resume sections
  // Models
  'models.shared': SharedModelRegistry; // Shared 3D model registry
  'models.resume': unknown; // Resume model configuration
  'models.ideas': unknown; // Ideas model configuration
  // Annotations
  'annotations.business': unknown; // Business 3D annotations
  'annotations.ideas': unknown; // Ideas 3D annotations
  // Particles
  'particles.config': unknown; // Particle system config
  'particles.network': unknown; // Network particle config
  'particles.colors': unknown; // Particle colors config
  // Expertise
  'expertise.faa': unknown; // FAA expertise data
  'expertise.composites': unknown; // Composites expertise data
  'expertise.umbrella': unknown; // Umbrella visualization data
  // Verticals
  'verticals.manufacturing': unknown; // Manufacturing vertical data
  'verticals.surveillance': unknown; // Surveillance vertical data
}

/**
 * Config Adapter Interface
 * Enables swapping between static and DB-backed configurations
 *
 * @example
 * ```typescript
 * // Current: StaticConfigAdapter
 * // Future: DatabaseConfigAdapter
 * const adapter = process.env.USE_DB_CONFIG
 *   ? new DatabaseConfigAdapter()
 *   : new StaticConfigAdapter()
 * ```
 */
export interface ConfigAdapter {
  /**
   * Get a configuration by key
   * @param key - ConfigKey to retrieve
   * @returns Configuration value
   */
  get<K extends ConfigKey>(key: K): Promise<ConfigMap[K]> | ConfigMap[K];

  /**
   * Check if a configuration exists
   * @param key - ConfigKey to check
   */
  has(key: ConfigKey): boolean;

  /**
   * Get all available configuration keys
   */
  keys(): ConfigKey[];
}

/**
 * Page-Specific Config Type
 * For configurations that belong to specific pages (not shared)
 */
export interface PageSpecificConfig {
  pageId: string;
  description: string;
  location: string; // File path relative to /app
}

/**
 * Configuration Metadata
 * For tracking where configs come from and their status
 */
export interface ConfigMetadata {
  key: ConfigKey;
  version: string;
  lastUpdated: string;
  deprecated?: boolean;
  deprecationMessage?: string;
  source: 'static' | 'database'; // Where the config comes from
}
