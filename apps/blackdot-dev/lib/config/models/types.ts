/**
 * Model Configuration Types
 *
 * Type definitions specific to 3D model configurations
 * Used across aerosim, particle-simulator, and other 3D scene components
 */

import type { Vector3D } from '../types';

/**
 * Model Transform - Position, rotation, and scale
 */
export interface ModelTransform {
  position: Vector3D;
  rotation: Vector3D;
  scale?: Vector3D;
}

/**
 * Individual Model Configuration
 * Defines how a specific 3D model should be rendered
 */
export interface ModelSpecConfig {
  targetSize: number;
  position: Vector3D;
  rotation: Vector3D;
  scale?: Vector3D;
  dynamic_source_area?: boolean;
  description?: string;
  tags?: string[];
}

/**
 * Model Registry - Collection of all model configurations
 * Maps model asset paths to their configurations
 */
export interface ModelRegistry {
  models: Record<string, ModelSpecConfig>;
  defaults: ModelSpecConfig;
  metadata?: {
    lastUpdated?: string;
    version?: string;
  };
}

/**
 * Model Load Options - Runtime options for loading models
 */
export interface ModelLoadOptions {
  forceReload?: boolean;
  cacheBuster?: boolean;
  fallbackToDefaults?: boolean;
}

/**
 * Model Load Result - Result of loading a model configuration
 */
export interface ModelLoadResult {
  config: ModelSpecConfig;
  source: 'exact' | 'filename' | 'defaults';
  modelPath: string;
}

/**
 * Composite Model Configuration
 * For scenes with multiple models (like aerosim wind tunnel)
 */
export interface CompositeModelConfig {
  id: string;
  models: Array<{
    path: string;
    config: ModelSpecConfig;
    visible?: boolean;
    interactive?: boolean;
  }>;
  environment?: {
    lighting?: string;
    background?: string;
    fog?: string;
  };
}

/**
 * Backward compatibility aliases
 */
export type SharedModelConfig = ModelSpecConfig;
export type SharedModelRegistry = ModelRegistry;
