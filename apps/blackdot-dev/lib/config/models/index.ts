/**
 * Model Configuration Barrel Export
 *
 * Centralized import path for all 3D model configurations:
 * - Resume models configuration
 * - Ideas models configuration
 * - Shared models registry (consolidated from aerosim, particle-simulator, public)
 * - Model configuration loader and utilities
 * - Model type definitions
 */

export * from './types'
export * from './resumeModels.config'
export * from './shared-models.config'
export * from './loader'
export * from './ideas-models.config'
