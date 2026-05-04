import { RUNWAY_CONFIG } from '../config/runway.config';

export type ModelId = keyof typeof RUNWAY_CONFIG.models.planes;
export type FleetId = keyof typeof RUNWAY_CONFIG.models.fleetModelMap;

export interface PlaneModelConfig {
  path: string;
  scale: number;
  nativeOrientation: [number, number, number];
  nativePosition: [number, number, number];
}

/**
 * Get model configuration by model ID
 * @param modelId - Model ID (1, 2, 3, etc.) or undefined to use default
 * @returns Model configuration or null if not found
 */
export function getModelConfig(modelId?: number | string): PlaneModelConfig | null {
  const id = (modelId ?? RUNWAY_CONFIG.defaultModelId) as ModelId;
  const model = RUNWAY_CONFIG.models.planes[id];
  return model || null;
}

/**
 * Get model path by model ID
 * @param modelId - Model ID or undefined to use default
 * @returns Model path or null if not found
 */
export function getModelPath(modelId?: number | string): string | null {
  const config = getModelConfig(modelId);
  return config?.path || null;
}

/**
 * Get model scale by model ID
 * @param modelId - Model ID or undefined to use default
 * @returns Model scale or 0.05 (default) if not found
 */
export function getModelScale(modelId?: number | string): number {
  const config = getModelConfig(modelId);
  return config?.scale ?? 0.05;
}

/**
 * Get native orientation by model ID
 * @param modelId - Model ID or undefined to use default
 * @returns Native orientation [x, y, z] in radians or [0, 0, 0] if not found
 */
export function getNativeOrientation(modelId?: number | string): [number, number, number] {
  const config = getModelConfig(modelId);
  return config?.nativeOrientation ?? [0, 0, 0];
}

/**
 * Get native position offset by model ID
 * @param modelId - Model ID or undefined to use default
 * @returns Native position offset [x, y, z] or [0, 0, 0] if not found
 */
export function getNativePosition(modelId?: number | string): [number, number, number] {
  const config = getModelConfig(modelId);
  return config?.nativePosition ?? [0, 0, 0];
}

/**
 * Get model ID for a fleet
 * @param fleetId - Fleet ID
 * @returns Model ID or default model ID if fleet not found
 */
export function getModelIdForFleet(fleetId: string): number {
  const modelId = RUNWAY_CONFIG.models.fleetModelMap[fleetId as FleetId];
  return modelId ?? RUNWAY_CONFIG.defaultModelId;
}
