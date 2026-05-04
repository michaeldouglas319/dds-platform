/**
 * Resume 3D Model Configuration
 * Centralized configuration for all 3D models used in resume scenes
 *
 * This file serves as the single source of truth for:
 * - Model type definitions
 * - Model asset paths
 * - Model format specifications
 * - Helper functions for model access
 *
 * Usage:
 *   import { modelTypes, getResumeModelConfig, type ModelType } from '@/lib/config/models/resumeModels.config';
 */

/**
 * Model type definitions for 3D scene rendering
 * Each model type specifies its format and asset path
 */
export type ModelType =
  | 'tesla'
  | 'renewed-vision'
  | 'skyline'
  | 'neural-network'
  | 'gcs'
  | 'building'
  | 'uav-drone'
  | 'book'
  | 'island';
export type ModelFormat = 'glb' | 'texture' | 'component' | 'geometry';

/**
 * Model configuration interface
 * Defines the structure for each model entry in the registry
 */
export interface ModelConfig {
  type: ModelType;
  format: ModelFormat;
  path: string;
  description?: string;
}

/**
 * Centralized model configuration registry
 * 
 * Add new models here - they'll automatically be available throughout the app.
 *
 * To add a new model:
 * 1. Add the model type to the ModelType union above
 * 2. Add the model entry to this registry
 * 3. The model will be available everywhere via getResumeModelConfig()
 */
export const modelTypes: Record<ModelType, ModelConfig> = {
  'tesla': {
    type: 'tesla',
    format: 'glb',
    path: '/assets/tesla_logo.glb',
    description: 'Tesla logo 3D model (GLB)'
  },
  'renewed-vision': {
    type: 'renewed-vision',
    format: 'texture',
    path: '/assets/pictures/renewed-vision.png',
    description: 'Renewed Vision logo texture'
  },
  'skyline': {
    type: 'skyline',
    format: 'texture',
    path: '/assets/pictures/skyline-products.png',
    description: 'Skyline Products logo texture'
  },
  'neural-network': {
    type: 'neural-network',
    format: 'component',
    path: '', // Component-based, no asset path needed
    description: 'Neural network 3D component'
  },
  'gcs': {
    type: 'gcs',
    format: 'texture',
    path: '/assets/pictures/GCS+Logo+white+transparent.webp',
    description: 'Global Call Solutions logo texture'
  },
  'building': {
    type: 'building',
    format: 'geometry',
    path: '',
    description: 'Procedural building geometry (Box 2x2x2)'
  },
  'uav-drone': {
    type: 'uav-drone',
    format: 'geometry',
    path: '',
    description: 'Procedural drone geometry (Box 1.5x0.5x1.5)'
  },
  'book': {
    type: 'book',
    format: 'geometry',
    path: '',
    description: 'Procedural book geometry (Box 1x1.5x0.3)'
  },
  'island': {
    type: 'island',
    format: 'geometry',
    path: '',
    description: 'Procedural island geometry (Cone)'
  }
} as const;

/**
 * Helper function to get model config by type
 *
 * @param modelType - The model type identifier
 * @returns The model configuration object
 * @throws Error if modelType is invalid
 *
 * @example
 * const teslaConfig = getResumeModelConfig('tesla');
 * console.log(teslaConfig.path); // '/assets/tesla_logo.glb'
 */
export const getResumeModelConfig = (modelType: ModelType): ModelConfig => {
  if (!(modelType in modelTypes)) {
    throw new Error(`Invalid model type: ${modelType}`);
  }
  return modelTypes[modelType];
};

/**
 * Helper function to check if a model type exists
 * Type guard for runtime validation
 * 
 * @param type - String to check
 * @returns True if type is a valid ModelType
 *
 * @example
 * if (isValidModelType(someString)) {
 *   // TypeScript now knows someString is ModelType
 *   const config = getResumeModelConfig(someString);
 * }
 */
export const isValidModelType = (type: string): type is ModelType => {
  return type in modelTypes;
};

/**
 * Get all available model types
 * 
 * @returns Array of all model type identifiers
 */
export const getAllModelTypes = (): ModelType[] => {
  return Object.keys(modelTypes) as ModelType[];
};

/**
 * Get models by format
 * 
 * @param format - The model format to filter by
 * @returns Array of model configs matching the format
 * 
 * @example
 * const textureModels = getModelsByFormat('texture');
 */
export const getModelsByFormat = (format: ModelFormat): ModelConfig[] => {
  return Object.values(modelTypes).filter(model => model.format === format);
};

