/**
 * Unified Model Configuration Loader
 *
 * Consolidates model configuration loading logic from:
 * - /app/aerosim/config/model-config-loader.ts
 * - /app/particle-simulator/config/model-config-loader.ts
 *
 * Provides type-safe access to model configurations with caching and
 * fallback to defaults for missing models.
 */

import { sharedModels, getSharedModelConfig } from './shared-models.config'
import type { SharedModelConfig, ModelLoadOptions, ModelLoadResult } from './types'

let configCache: typeof sharedModels | null = null

// Force reload config on development (disable cache)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('beforeunload', () => {
    configCache = null
  })
}

/**
 * Load model configuration registry
 * Reads from the centralized TypeScript config with optional cache busting
 *
 * @param options - Load options (forceReload, cacheBuster)
 * @returns The model configuration registry
 */
export function loadModelConfig(options?: ModelLoadOptions) {
  const { forceReload = false } = options || {}

  if (configCache && !forceReload) {
    return configCache
  }

  // Use the centralized TypeScript config
  configCache = sharedModels
  console.log('Model config loaded successfully', configCache)
  console.log('Available model paths:', Object.keys(configCache.models))
  return configCache
}

/**
 * Get configuration for a specific model path
 *
 * @param modelPath - The model asset path
 * @param options - Load options
 * @returns The model configuration and metadata
 *
 * @example
 * ```typescript
 * const result = getModelConfig('/assets/models/super_cam__-_rusian_reconnaissance_drone.glb')
 * console.log(result.config.targetSize) // 100
 * console.log(result.source) // 'exact' | 'filename' | 'defaults'
 * ```
 */
export function getModelConfig(
  modelPath: string,
  options?: ModelLoadOptions
): ModelLoadResult {
  const config = loadModelConfig(options)

  console.log(`Looking for config: "${modelPath}"`)
  console.log('Available paths:', Object.keys(config.models))

  // Try exact match first
  if (modelPath in config.models) {
    const exactConfig = config.models[modelPath as keyof typeof config.models]
    console.log(`✓ Found exact config for: ${modelPath}`, exactConfig)
    return {
      config: exactConfig,
      source: 'exact',
      modelPath,
    }
  }

  // Try matching by filename (in case path differs)
  const modelFilename = modelPath.split('/').pop() || modelPath
  for (const [configPath, configData] of Object.entries(config.models)) {
    const configFilename = configPath.split('/').pop() || configPath
    if (
      configPath.includes(modelFilename) ||
      configFilename === modelFilename ||
      modelPath.includes(configPath.split('/').pop() || '')
    ) {
      console.log(`✓ Found config by filename match: ${configPath}`, configData)
      return {
        config: configData,
        source: 'filename',
        modelPath,
      }
    }
  }

  // Return defaults
  console.warn(`✗ No config found for "${modelPath}", using defaults`)
  return {
    config: config.defaults,
    source: 'defaults',
    modelPath,
  }
}

/**
 * Clear config cache (useful for hot reloading)
 */
export function clearModelConfigCache(): void {
  configCache = null
  console.log('Model config cache cleared')
}

/**
 * Get all model paths
 *
 * @returns Array of all configured model paths
 */
export function getAllModelPaths(): string[] {
  const config = loadModelConfig()
  return Object.keys(config.models)
}

/**
 * Check if a model has a configuration
 *
 * @param modelPath - The model path to check
 * @returns True if the model has a specific configuration
 */
export function hasModelConfig(modelPath: string): boolean {
  const config = loadModelConfig()
  return modelPath in config.models || getAllModelPaths().some(path =>
    path.includes(modelPath.split('/').pop() || '') ||
    modelPath.includes(path.split('/').pop() || '')
  )
}
