/**
 * useConfig Hook - Type-Safe Configuration Access
 *
 * Provides centralized, type-safe access to all application configurations.
 * Automatically works with both static and future database-backed configs.
 *
 * @see /CLAUDE.md for architecture documentation
 *
 * @example
 * ```typescript
 * import { useConfig } from '@/lib/hooks'
 *
 * export function MyComponent() {
 *   const resumeJobs = useConfig('content.resume')
 *   const models = useConfig('models.shared')
 *   const viewPresets = useConfig('design.views')
 *   // Use the config data...
 * }
 * ```
 */

'use client'

import { useMemo } from 'react'
import { StaticConfigAdapter } from '@/lib/config/adapters/config-adapter'
import type { ConfigKey, ConfigMap } from '@/lib/config/types'

// Create a default adapter instance (can be replaced by provider)
let defaultAdapter = new StaticConfigAdapter()

/**
 * Set a custom configuration adapter at runtime
 * Useful for testing or swapping to database-backed configs
 */
export function setConfigAdapter(adapter: typeof defaultAdapter): void {
  defaultAdapter = adapter
}

/**
 * React Hook for accessing configurations
 *
 * @param key - The configuration key (with full TypeScript autocomplete)
 * @returns The configuration value with correct type
 *
 * @throws Error if configuration key is unknown
 *
 * @example
 * ```typescript
 * const resume = useConfig('content.resume')  // Type: ResumeJob[]
 * const models = useConfig('models.shared')   // Type: SharedModelRegistry
 * const tokens = useConfig('design.tokens')   // Type: DesignTokens
 * ```
 */
export function useConfig<K extends ConfigKey>(key: K): ConfigMap[K] {
  return useMemo(() => {
    try {
      const value = defaultAdapter.get(key)
      return value as ConfigMap[K]
    } catch (error) {
      console.error(`Failed to load config for key: ${key}`, error)
      throw new Error(`Configuration not found: ${key}`)
    }
  }, [key])
}

/**
 * Server-side function to get configuration (no React hooks)
 * Use this in server components or server functions
 *
 * @param key - The configuration key
 * @returns The configuration value
 *
 * @example
 * ```typescript
 * import { getConfig } from '@/lib/hooks/useConfig'
 *
 * export async function MyServerComponent() {
 *   const resume = getConfig('content.resume')
 *   // Use resume data...
 * }
 * ```
 */
export function getConfig<K extends ConfigKey>(key: K): ConfigMap[K] {
  try {
    const value = defaultAdapter.get(key)
    return value as ConfigMap[K]
  } catch (error) {
    console.error(`Failed to load config for key: ${key}`, error)
    throw new Error(`Configuration not found: ${key}`)
  }
}

/**
 * Get all available configuration keys
 * Useful for debugging or generating documentation
 *
 * @returns Array of all available configuration keys
 */
export function getAvailableConfigKeys(): ConfigKey[] {
  const keys = defaultAdapter.keys()
  return Array.isArray(keys) ? keys : []
}

/**
 * Check if a configuration exists
 * Useful for conditional rendering based on config availability
 *
 * @param key - The configuration key to check
 * @returns True if the configuration exists
 *
 * @example
 * ```typescript
 * if (hasConfig('features.advancedAnalytics')) {
 *   // Show advanced analytics
 * }
 * ```
 */
export function hasConfig(key: ConfigKey): boolean {
  try {
    const exists = defaultAdapter.has(key)
    return typeof exists === 'boolean' ? exists : false
  } catch {
    return false
  }
}

/**
 * Reload configuration from adapter
 * Useful after configuration updates or for cache invalidation
 *
 * @param key - Optional specific key to reload
 *
 * @example
 * ```typescript
 * // Reload all configs
 * reloadConfig()
 *
 * // Reload specific config
 * reloadConfig('content.resume')
 * ```
 */
export function reloadConfig(key?: ConfigKey): void {
  if (defaultAdapter.invalidate) {
    defaultAdapter.invalidate(key)
  }
}

/**
 * Get information about configuration source
 *
 * @returns Configuration source ('static', 'database', etc.)
 */
export function getConfigSource(): string {
  return defaultAdapter.getSource()
}
