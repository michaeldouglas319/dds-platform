/**
 * Canvas3D config resolution: validate and transform model paths.
 * Maps legacy /models/* to /assets/models/* and applies path rules.
 */

import type { Canvas3DConfig, Canvas3DModel } from '@/lib/types/canvas3d.types';

const MODELS_PREFIX = '/models/';
const ASSETS_MODELS_PREFIX = '/assets/models/';

/**
 * Resolves a single model path: /models/... -> /assets/models/...
 * Leaves paths that already start with /assets/models/ or other valid prefixes unchanged.
 */
export function resolveModelPath(modelPath: string): string {
  if (typeof modelPath !== 'string' || !modelPath.startsWith('/')) {
    return modelPath;
  }
  if (modelPath.startsWith(MODELS_PREFIX)) {
    return modelPath.replace(MODELS_PREFIX, ASSETS_MODELS_PREFIX);
  }
  return modelPath;
}

/**
 * Validates and transforms a Canvas3D model config (path resolution).
 */
export function resolveCanvas3DModel(model: Canvas3DModel): Canvas3DModel {
  return {
    ...model,
    modelPath: resolveModelPath(model.modelPath),
  };
}

/**
 * Resolves full Canvas3D config: validates and transforms model paths.
 */
export function resolveCanvas3DConfig(config: Canvas3DConfig): Canvas3DConfig {
  const models = (config.models ?? []).map(resolveCanvas3DModel);
  return {
    ...config,
    models,
  };
}
