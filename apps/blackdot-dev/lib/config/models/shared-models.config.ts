/**
 * Shared 3D Model Configuration Registry
 *
 * This file consolidates model configurations previously scattered across:
 * - /public/config/model-config.json
 * - /app/aerosim/config/model-config.json
 * - /app/particle-simulator/config/model-config.json
 *
 * Migrated to TypeScript for type safety, easier maintenance, and future DB integration.
 *
 * Usage:
 * ```typescript
 * import { sharedModels, getSharedModelConfig } from '@/lib/config/models/shared-models.config'
 *
 * // Get config for a specific model
 * const droneConfig = getSharedModelConfig('/assets/models/super_cam__-_rusian_reconnaissance_drone.glb')
 *
 * // Get all models
 * const allModels = sharedModels.models
 * ```
 */

import type { SharedModelRegistry, SharedModelConfig } from './types'

/**
 * Unified model configuration registry
 * Contains all 3D models used across aerosim, particle-simulator, and other 3D scenes
 */
export const sharedModels: SharedModelRegistry = {
  models: {
    '/assets/models/super_cam__-_rusian_reconnaissance_drone.glb': {
      targetSize: 100,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dynamic_source_area: true,
      description: 'Russian reconnaissance drone - high resolution model',
      tags: ['drone', 'reconnaissance', 'military'],
    },
    '/assets/models/dron_low_poly_3d_model_gltf/scene.gltf': {
      targetSize: 60,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dynamic_source_area: true,
      description: 'Low-poly drone model for performance-critical scenes',
      tags: ['drone', 'low-poly', 'optimized'],
    },
    '/assets/models/drone_uav_wing_desert_camo_gltf/scene.gltf': {
      targetSize: 60,
      position: { x: 10, y: 90, z: 50 },
      rotation: { x: 0.1745, y: 1.5708, z: 0.8727 },
      dynamic_source_area: true,
      description: 'UAV drone with desert camouflage - pre-positioned for specific scenes',
      tags: ['drone', 'uav', 'military'],
    },
    '/assets/models/uav/Meshy_AI_Make_a_engineering_ap_1230052632_generate.glb': {
      targetSize: 60,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dynamic_source_area: true,
      description: 'AI-generated UAV engineering model',
      tags: ['drone', 'uav', 'ai-generated'],
    },
    '/assets/models/2_plane.glb': {
      targetSize: 80,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dynamic_source_area: true,
      description: 'Aircraft model for aerial scenes',
      tags: ['aircraft', 'plane', 'transport'],
    },
  },
  defaults: {
    targetSize: 60,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    dynamic_source_area: true,
    description: 'Default model configuration',
  },
  metadata: {
    lastUpdated: '2026-01-18',
    version: '1.0',
  },
} as const

/**
 * Get configuration for a specific model path
 *
 * @param modelPath - The full path to the model asset
 * @returns The model configuration
 *
 * @example
 * ```typescript
 * const config = getSharedModelConfig('/assets/models/super_cam__-_rusian_reconnaissance_drone.glb')
 * console.log(config.targetSize) // 100
 * ```
 */
export function getSharedModelConfig(modelPath: string): SharedModelConfig {
  // Try exact match first
  if (modelPath in sharedModels.models) {
    return sharedModels.models[modelPath as keyof typeof sharedModels.models]
  }

  // Try matching by filename (in case path differs)
  const modelFilename = modelPath.split('/').pop() || modelPath
  for (const [configPath, configData] of Object.entries(sharedModels.models)) {
    const configFilename = configPath.split('/').pop() || configPath
    if (
      configPath.includes(modelFilename) ||
      configFilename === modelFilename ||
      modelPath.includes(configPath.split('/').pop() || '')
    ) {
      return configData
    }
  }

  // Return defaults if no match found
  return sharedModels.defaults
}

/**
 * Get all available model paths
 *
 * @returns Array of model asset paths
 */
export function getSharedModelPaths(): string[] {
  return Object.keys(sharedModels.models)
}

/**
 * Check if a model is configured
 *
 * @param modelPath - The model path to check
 * @returns True if the model has a specific configuration
 */
export function hasSharedModelConfig(modelPath: string): boolean {
  return modelPath in sharedModels.models || getSharedModelPaths().some(path =>
    path.includes(modelPath.split('/').pop() || '') ||
    modelPath.includes(path.split('/').pop() || '')
  )
}

/**
 * Get models by tag
 *
 * @param tag - The tag to filter by (e.g., 'drone', 'aircraft')
 * @returns Array of model configs matching the tag
 */
export function getSharedModelsByTag(tag: string): Array<[string, SharedModelConfig]> {
  return Object.entries(sharedModels.models).filter(([_, config]) =>
    config.tags?.includes(tag)
  )
}
