/**
 * Model Loader Utility
 *
 * Handles loading, caching, and fallback rendering for 3D GLTF models.
 * Provides utilities for model preloading, fallback geometry generation,
 * and error handling with graceful degradation.
 *
 * This is a pure utility module - it doesn't require React or Three.js hooks.
 * For React integration, use the modelLoader hook from lib/threejs/loaders/modelLoader.tsx
 */

import type { GLTF } from 'three-stdlib';
import * as THREE from 'three';

/**
 * Configuration for model loading
 */
export interface ModelLoadConfig {
  path: string;
  fallbackGeometry?: 'box' | 'sphere' | 'cone' | 'plane';
  scale?: number;
  position?: [number, number, number];
  preload?: boolean;
}

/**
 * Result of model loading attempt
 */
export interface ModelLoadResult {
  success: boolean;
  model: GLTF | null;
  fallback?: THREE.BufferGeometry;
  error?: Error;
  message?: string;
}

/**
 * Fallback geometry options
 */
export type FallbackGeometryType = 'box' | 'sphere' | 'cone' | 'plane';

/**
 * In-memory cache for loaded models
 * Production apps may want to use IndexedDB or WebWorkers
 */
const modelCache = new Map<string, GLTF>();

/**
 * Track loading in progress to avoid duplicate requests
 */
const loadingPromises = new Map<string, Promise<GLTF | null>>();

/**
 * Load a GLTF model from the given path
 *
 * Implements:
 * - Simple deduplication (if loading is in progress, returns same promise)
 * - Error handling with fallback geometry generation
 * - Model caching
 *
 * @param config - Model load configuration
 * @returns Promise<ModelLoadResult>
 */
export async function loadModel(config: ModelLoadConfig): Promise<ModelLoadResult> {
  const { path, fallbackGeometry, scale = 1, position = [0, 0, 0], preload } = config;

  if (!path) {
    return {
      success: false,
      model: null,
      fallback: getModelFallback(fallbackGeometry),
      error: new Error('Model path is required'),
      message: 'Model path is required for loading'
    };
  }

  // Check cache first
  if (modelCache.has(path)) {
    return {
      success: true,
      model: modelCache.get(path)!,
      message: 'Loaded from cache'
    };
  }

  // Deduplicate in-progress loads
  if (loadingPromises.has(path)) {
    try {
      const model = await loadingPromises.get(path)!;
      return {
        success: model !== null,
        model,
        fallback: model ? undefined : getModelFallback(fallbackGeometry),
        message: model ? 'Loaded from in-progress request' : 'Failed to load model'
      };
    } catch (error) {
      return {
        success: false,
        model: null,
        fallback: getModelFallback(fallbackGeometry),
        error: error instanceof Error ? error : new Error(String(error)),
        message: `Failed to load model: ${String(error)}`
      };
    }
  }

  // Start new load
  const loadPromise = loadModelInternal(path);
  loadingPromises.set(path, loadPromise);

  try {
    const model = await loadPromise;

    if (model) {
      modelCache.set(path, model);
      return {
        success: true,
        model,
        message: 'Model loaded successfully'
      };
    } else {
      return {
        success: false,
        model: null,
        fallback: getModelFallback(fallbackGeometry),
        message: 'Model failed to load, using fallback geometry'
      };
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      success: false,
      model: null,
      fallback: getModelFallback(fallbackGeometry),
      error: err,
      message: `Model load error: ${err.message}`
    };
  } finally {
    loadingPromises.delete(path);
  }
}

/**
 * Internal model loading function
 * Override this in your app if you have a custom GLTF loader setup
 */
async function loadModelInternal(path: string): Promise<GLTF | null> {
  try {
    // This is a placeholder - actual implementation depends on your Three.js setup
    // In a real app, you'd use GLTFLoader from Three.js
    // Example:
    // const loader = new GLTFLoader();
    // return new Promise((resolve, reject) => {
    //   loader.load(path, resolve, undefined, reject);
    // });

    // For now, return null to indicate no loader is configured
    console.warn(
      `Model loading not configured. Please implement loadModelInternal() for path: ${path}`
    );
    return null;
  } catch (error) {
    console.error(`Failed to load model at ${path}:`, error);
    return null;
  }
}

/**
 * Get fallback geometry for a given type
 *
 * Returns Three.js BufferGeometry suitable for placeholder rendering
 * when model loading fails
 *
 * @param type - Fallback geometry type ('box' | 'sphere' | 'cone' | 'plane')
 * @returns Three.js BufferGeometry
 */
export function getModelFallback(type: FallbackGeometryType = 'sphere'): THREE.BufferGeometry {
  switch (type) {
    case 'box':
      return new THREE.BoxGeometry(1, 1, 1);

    case 'sphere':
      return new THREE.SphereGeometry(0.5, 32, 32);

    case 'cone':
      return new THREE.ConeGeometry(0.5, 1, 32);

    case 'plane':
      return new THREE.PlaneGeometry(1, 1);

    default:
      return new THREE.SphereGeometry(0.5, 32, 32);
  }
}

/**
 * Create a fallback mesh for when model loading fails
 *
 * @param type - Fallback geometry type
 * @param color - Material color (default: gray)
 * @returns Three.js Mesh with fallback geometry
 */
export function createFallbackMesh(
  type: FallbackGeometryType = 'sphere',
  color: string = '#808080'
): THREE.Mesh {
  const geometry = getModelFallback(type);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    metalness: 0.2
  });

  return new THREE.Mesh(geometry, material);
}

/**
 * Preload a model without waiting for it to fully load
 *
 * Useful for prefetching models that will be needed soon
 *
 * @param path - Model path to preload
 * @returns Promise that completes when preload is queued
 */
export async function preloadModel(path: string): Promise<void> {
  if (modelCache.has(path) || loadingPromises.has(path)) {
    return;
  }

  // Start loading in background, but don't wait
  const promise = loadModelInternal(path);
  loadingPromises.set(path, promise);

  try {
    const model = await promise;
    if (model) {
      modelCache.set(path, model);
    }
  } finally {
    loadingPromises.delete(path);
  }
}

/**
 * Clear a model from cache
 *
 * @param path - Model path to clear
 */
export function clearModelFromCache(path: string): void {
  const model = modelCache.get(path);

  if (model) {
    // Clean up Three.js resources
    model.scene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.geometry?.dispose();
        if (Array.isArray(node.material)) {
          node.material.forEach((mat) => mat.dispose());
        } else if (node.material) {
          node.material.dispose();
        }
      }
    });

    modelCache.delete(path);
  }
}

/**
 * Clear all models from cache
 *
 * Useful for cleanup when changing routes or sections
 */
export function clearAllModelsFromCache(): void {
  modelCache.forEach((model, path) => {
    clearModelFromCache(path);
  });
  modelCache.clear();
}

/**
 * Get cache statistics
 *
 * @returns Object with cache statistics
 */
export function getModelCacheStats() {
  return {
    cachedModels: modelCache.size,
    loadingModels: loadingPromises.size,
    cachedPaths: Array.from(modelCache.keys()),
    loadingPaths: Array.from(loadingPromises.keys())
  };
}

/**
 * Configure custom model loader function
 *
 * Call this during app initialization to provide your own GLTF loader
 *
 * @example
 * ```typescript
 * import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
 * import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
 *
 * const dracoLoader = new DRACOLoader();
 * dracoLoader.setDecoderPath('/draco/');
 *
 * const gltfLoader = new GLTFLoader();
 * gltfLoader.setDRACOLoader(dracoLoader);
 *
 * setCustomModelLoader((path: string) => {
 *   return new Promise((resolve, reject) => {
 *     gltfLoader.load(path, resolve, undefined, reject);
 *   });
 * });
 * ```
 */
let customLoader: ((path: string) => Promise<GLTF | null>) | null = null;

export function setCustomModelLoader(
  loader: (path: string) => Promise<GLTF | null>
): void {
  customLoader = loader;
}

/**
 * Update the internal loader to use custom implementation
 */
async function loadModelInternalWithCustom(path: string): Promise<GLTF | null> {
  if (customLoader) {
    return customLoader(path);
  }
  return loadModelInternal(path);
}

/**
 * Model loader options for different use cases
 */
export const modelLoaderPresets = {
  /**
   * Minimal fallback - simple sphere
   */
  minimal: {
    fallbackGeometry: 'sphere' as const,
    preload: false
  },

  /**
   * Balanced - box fallback with preloading
   */
  balanced: {
    fallbackGeometry: 'box' as const,
    preload: true
  },

  /**
   * Full featured - cone fallback with preloading and scaling
   */
  full: {
    fallbackGeometry: 'cone' as const,
    preload: true,
    scale: 1.5
  }
};
