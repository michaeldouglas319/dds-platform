/**
 * Configuration Adapter Pattern
 *
 * Provides an abstraction layer for config access, enabling seamless migration
 * from static configs to database-backed configurations without changing consumers.
 *
 * @see /CLAUDE.md for architecture documentation
 *
 * @example
 * ```typescript
 * // Current: StaticConfigAdapter (default)
 * const adapter = new StaticConfigAdapter()
 * const config = adapter.get('content.resume')
 *
 * // Future: DatabaseConfigAdapter
 * // const adapter = new DatabaseConfigAdapter(dbClient)
 * // const config = await adapter.get('content.resume')
 * // (Consumers won't need to change!)
 * ```
 */

import type { ConfigKey, ConfigMap } from '../types'

/**
 * Configuration Source Type
 * Indicates where configuration data comes from
 */
export type ConfigSource = 'static' | 'database' | 'api' | 'hybrid'

/**
 * Configuration Cache Options
 */
export interface ConfigCacheOptions {
  enabled: boolean
  ttl?: number // Time to live in milliseconds
}

/**
 * ConfigAdapter Interface
 * Defines the contract for configuration providers
 */
export interface ConfigAdapter {
  /**
   * Get a configuration by key
   * @param key - Configuration key
   * @returns Configuration value (sync or async)
   */
  get<K extends ConfigKey>(key: K): ConfigMap[K] | Promise<ConfigMap[K]>

  /**
   * Check if a configuration exists
   * @param key - Configuration key
   */
  has(key: ConfigKey): boolean | Promise<boolean>

  /**
   * Get all available configuration keys
   */
  keys(): ConfigKey[] | Promise<ConfigKey[]>

  /**
   * Set configuration value (for dynamic configs)
   * @param key - Configuration key
   * @param value - Configuration value
   */
  set?<K extends ConfigKey>(key: K, value: ConfigMap[K]): void | Promise<void>

  /**
   * Invalidate cache for a specific key or all keys
   * @param key - Optional specific key to invalidate
   */
  invalidate?(key?: ConfigKey): void | Promise<void>

  /**
   * Get configuration source information
   */
  getSource(): ConfigSource
}

/**
 * Static Configuration Adapter (Current Implementation)
 *
 * Loads configurations directly from static TypeScript imports.
 * Suitable for:
 * - Development
 * - Small to medium-sized apps
 * - Applications without runtime config updates
 *
 * Performance: O(1) lookup, zero network overhead
 */
export class StaticConfigAdapter implements ConfigAdapter {
  private cache: Map<ConfigKey, unknown> = new Map()
  private cacheOptions: ConfigCacheOptions

  constructor(cacheOptions: ConfigCacheOptions = { enabled: true }) {
    this.cacheOptions = cacheOptions
  }

  get<K extends ConfigKey>(key: K): ConfigMap[K] {
    // Check cache first
    if (this.cacheOptions.enabled && this.cache.has(key)) {
      return this.cache.get(key) as ConfigMap[K]
    }

    // Load from static imports
    const value = this.loadStaticConfig(key)

    // Cache if enabled
    if (this.cacheOptions.enabled) {
      this.cache.set(key, value)
    }

    return value
  }

  has(key: ConfigKey): boolean {
    // Try to load; if it throws or returns undefined, return false
    try {
      const value = this.get(key)
      return value !== undefined && value !== null
    } catch {
      return false
    }
  }

  keys(): ConfigKey[] {
    // Return all available config keys
    const keys: ConfigKey[] = [
      // Design
      'design.tokens',
      'design.views',
      // Navigation
      'navigation.config',
      'navigation.routes',
      'navigation.routeMetadata',
      // Content
      'content.resume',
      'content.business',
      'content.ideas',
      'content.sections',
      'content.sections.resume',
      // Models
      'models.shared',
      'models.resume',
      'models.ideas',
      // Annotations
      'annotations.business',
      'annotations.ideas',
      // Particles
      'particles.config',
      'particles.network',
      'particles.colors',
      // Expertise
      'expertise.faa',
      'expertise.composites',
      'expertise.umbrella',
      // Verticals
      'verticals.manufacturing',
      'verticals.surveillance',
    ]
    return keys
  }

  invalidate(key?: ConfigKey): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  getSource(): ConfigSource {
    return 'static'
  }

  /**
   * Load static configuration by key
   * This is the core logic that dynamically requires config modules
   */
  private loadStaticConfig<K extends ConfigKey>(key: K): ConfigMap[K] {
    // Dynamic require mapping for different config keys
    // Uses lazy loading to minimize bundle size
    switch (key) {
      // Design configs
      case 'design.tokens':
        return require('@/lib/config/design').SPACING_TOKENS as ConfigMap[K]
      case 'design.views':
        return require('@/lib/config/design').VIEW_PRESETS as ConfigMap[K]

      // Navigation configs
      case 'navigation.config':
        return require('@/lib/config/navigation').NAVIGATION_ITEMS as ConfigMap[K]
      case 'navigation.routes':
        return require('@/lib/config/navigation').ROUTES_CONFIG as ConfigMap[K]
      case 'navigation.routeMetadata':
        return require('@/lib/config/navigation').getRouteMetadata as ConfigMap[K]

      // Content configs
      case 'content.resume':
        return require('@/lib/config/content').resumeJobs as ConfigMap[K]
      case 'content.business':
        return require('@/lib/config/content').businessSections as ConfigMap[K]
      case 'content.ideas':
        return require('@/lib/config/content').ideasSections as ConfigMap[K]
      case 'content.sections':
        return require('@/lib/config/content').sections as ConfigMap[K]
      case 'content.sections.resume':
        return require('@/lib/config/content').resumeSections as ConfigMap[K]

      // Model configs
      case 'models.shared':
        return require('@/lib/config/models').sharedModels as ConfigMap[K]
      case 'models.resume':
        return require('@/lib/config/models').modelTypes as ConfigMap[K]
      case 'models.ideas':
        return require('@/lib/config/models').ideasModels as ConfigMap[K]

      // Annotation configs
      case 'annotations.business':
        return require('@/lib/config/annotations').buildingAnnotations as ConfigMap[K]
      case 'annotations.ideas':
        return require('@/lib/config/annotations').ideasAnnotations as ConfigMap[K]

      // Particle configs
      case 'particles.config':
        return require('@/lib/config/particles').PARTICLE_CONFIG as ConfigMap[K]
      case 'particles.network':
        return require('@/lib/config/particles').NETWORK_CONFIG as ConfigMap[K]
      case 'particles.colors':
        return require('@/lib/config/particles').PARTICLE_COLORS as ConfigMap[K]

      // Expertise configs
      case 'expertise.faa':
        return require('@/lib/config/expertise').FAA_EXPERTISE as ConfigMap[K]
      case 'expertise.composites':
        return require('@/lib/config/expertise').COMPOSITES_EXPERTISE as ConfigMap[K]
      case 'expertise.umbrella':
        return require('@/lib/config/expertise').UMBRELLA_VISUALIZATION as ConfigMap[K]

      // Vertical configs
      case 'verticals.manufacturing':
        return require('@/lib/config/verticals').MANUFACTURING_VERTICAL as ConfigMap[K]
      case 'verticals.surveillance':
        return require('@/lib/config/verticals').SURVEILLANCE_VERTICAL as ConfigMap[K]

      default:
        throw new Error(`Unknown configuration key: ${key as string}`)
    }
  }
}

/**
 * Database Configuration Adapter (Future Implementation)
 *
 * @placeholder
 * This is a placeholder for future implementation.
 * Will load configurations from a database or API.
 *
 * Suitable for:
 * - Large-scale applications
 * - Runtime config updates without redeployment
 * - Multi-tenant applications
 * - A/B testing and feature flags
 *
 * Implementation notes:
 * - Should cache configs to minimize database queries
 * - Should implement invalidation strategies
 * - Should handle database connectivity failures gracefully
 */
export class DatabaseConfigAdapter implements ConfigAdapter {
  private cache: Map<ConfigKey, { value: unknown; timestamp: number }> = new Map()
  private cacheOptions: ConfigCacheOptions
  private dbClient?: unknown // Placeholder for future DB client

  constructor(
    dbClient?: unknown,
    cacheOptions: ConfigCacheOptions = { enabled: true, ttl: 3600000 } // 1 hour default
  ) {
    this.dbClient = dbClient
    this.cacheOptions = cacheOptions
  }

  async get<K extends ConfigKey>(key: K): Promise<ConfigMap[K]> {
    // TODO: Implement database fetching
    throw new Error(
      'DatabaseConfigAdapter not yet implemented. Use StaticConfigAdapter for now.'
    )
  }

  async has(key: ConfigKey): Promise<boolean> {
    // TODO: Implement database check
    return false
  }

  async keys(): Promise<ConfigKey[]> {
    // TODO: Implement database query for all keys
    return []
  }

  async set<K extends ConfigKey>(key: K, value: ConfigMap[K]): Promise<void> {
    // TODO: Implement database update
  }

  async invalidate(key?: ConfigKey): Promise<void> {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  getSource(): ConfigSource {
    return 'database'
  }
}

/**
 * Get the default configuration adapter
 * Respects environment variables for choosing adapter type
 */
export function getDefaultConfigAdapter(): ConfigAdapter {
  if (process.env.CONFIG_ADAPTER === 'database') {
    // Future: return new DatabaseConfigAdapter(dbClient)
    console.warn('DATABASE_ADAPTER requested but not yet implemented, using StaticConfigAdapter')
  }

  return new StaticConfigAdapter({
    enabled: process.env.CONFIG_CACHE !== 'false',
    ttl: parseInt(process.env.CONFIG_CACHE_TTL || '3600000', 10),
  })
}
