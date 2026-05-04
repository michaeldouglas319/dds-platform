/**
 * Asset Manager
 * Production-grade asset loading with caching, error handling, and memory management
 *
 * Features:
 * - Automatic model caching (avoid reloading same models)
 * - Memory-aware loading (track what's loaded)
 * - Error recovery
 * - Progress tracking
 * - Cleanup on demand
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { CachedModelData, AssetLoadResult, AssetLoadState } from '../models/types';

/**
 * Asset cache - singleton pattern
 * Stores loaded models to prevent duplicate loading
 */
class AssetManagerSingleton {
  private cache: Map<string, CachedModelData> = new Map();
  private loaders: Map<string, THREE.Loader> = new Map();
  private loadingPromises: Map<string, Promise<CachedModelData>> = new Map();
  private maxCacheSize = 100 * 1024 * 1024; // 100MB
  private currentCacheSize = 0;

  constructor() {
    // Initialize loaders
    this.loaders.set('gltf', new GLTFLoader());
  }

  /**
   * Load a model from path
   * Returns cached version if already loaded
   * Handles errors gracefully
   */
  async loadModel(
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<CachedModelData> {
    // Return from cache if exists
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    // Return existing promise if load is in progress
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path)!;
    }

    // Start new load
    const loadPromise = this._loadModelInternal(path, onProgress);
    this.loadingPromises.set(path, loadPromise);

    try {
      const result = await loadPromise;
      this.loadingPromises.delete(path);
      return result;
    } catch (error) {
      this.loadingPromises.delete(path);
      throw error;
    }
  }

  /**
   * Internal model loading logic
   */
  private async _loadModelInternal(
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<CachedModelData> {
    return new Promise((resolve, reject) => {
      const loader = this.loaders.get('gltf') as GLTFLoader;

      loader.load(
        path,
        (gltf: { scene: THREE.Group }) => {
          // Clone the scene to avoid shared references
          const scene = gltf.scene.clone(true);

          // Compute bounding box
          const box = new THREE.Box3().setFromObject(scene);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          const cachedData: CachedModelData = {
            scene,
            boundingBox: {
              width: size.x,
              height: size.y,
              depth: size.z,
              center: center.toArray() as [number, number, number],
              radius: size.length() / 2,
            },
            metadata: {
              id: path.split('/').pop()?.split('.')[0] || 'unknown',
              name: path.split('/').pop() || 'Unknown Model',
              path,
              category: 'unknown',
            },
            loaded: Date.now(),
          };

          // Cache it
          this.cache.set(path, cachedData);

          resolve(cachedData);
        },
        (progressEvent: ProgressEvent<EventTarget>) => {
          if (onProgress) {
            const progress = progressEvent.lengthComputable
              ? progressEvent.loaded / progressEvent.total
              : 0;
            onProgress(progress);
          }
        },
        (err: unknown) => {
          console.error(`Failed to load model: ${path}`, err);
          reject(new Error(`Failed to load model: ${path}`));
        }
      );
    });
  }

  /**
   * Get cached model without loading
   */
  getFromCache(path: string): CachedModelData | null {
    return this.cache.get(path) ?? null;
  }

  /**
   * Check if model is cached
   */
  isCached(path: string): boolean {
    return this.cache.has(path);
  }

  /**
   * Clear cache for specific model
   */
  clearCache(path: string): void {
    const cached = this.cache.get(path);
    if (cached) {
      this._disposeModel(cached.scene);
      this.cache.delete(path);
    }
  }

  /**
   * Clear entire cache
   */
  clearAllCache(): void {
    this.cache.forEach((cached) => {
      this._disposeModel(cached.scene);
    });
    this.cache.clear();
  }

  /**
   * Dispose of all WebGL resources
   */
  private _disposeModel(scene: THREE.Object3D): void {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((mat) => {
            // Dispose textures
            Object.keys(mat).forEach((key) => {
              const value = (mat as THREE.Material & Record<string, unknown>)[key];
              if (value instanceof THREE.Texture) {
                value.dispose();
              }
            });
            mat.dispose();
          });
        }
      }
    });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cachedModels: this.cache.size,
      cacheSize: this.currentCacheSize,
      cachedPaths: Array.from(this.cache.keys()),
    };
  }

  /**
   * Get list of all cached models
   */
  getCachedModels(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Singleton instance
let assetManagerInstance: AssetManagerSingleton | null = null;

/**
 * Get the asset manager singleton
 */
export function getAssetManager(): AssetManagerSingleton {
  if (!assetManagerInstance) {
    assetManagerInstance = new AssetManagerSingleton();
  }
  return assetManagerInstance;
}

/**
 * Hook for React - load a model
 * Can be used in useEffect or suspense
 */
export async function loadAsset<T>(
  path: string,
  type: 'model' = 'model',
  onProgress?: (progress: number) => void
): Promise<T> {
  const manager = getAssetManager();

  if (type === 'model') {
    const cached = await manager.loadModel(path, onProgress);
    return cached as T;
  }

  throw new Error(`Unsupported asset type: ${type}`);
}

/**
 * Preload models for better UX
 * Can be called on app init or before scene
 */
export async function preloadModels(
  paths: string[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const manager = getAssetManager();

  for (let i = 0; i < paths.length; i++) {
    try {
      await manager.loadModel(paths[i]);
      if (onProgress) {
        onProgress(i + 1, paths.length);
      }
    } catch (error) {
      console.warn(`Failed to preload: ${paths[i]}`, error);
    }
  }
}

/**
 * Check if all models are loaded
 */
export function areModelsLoaded(paths: string[]): boolean {
  const manager = getAssetManager();
  return paths.every((path) => manager.isCached(path));
}

/**
 * Cleanup: dispose model from cache
 */
export function disposeAsset(path: string): void {
  getAssetManager().clearCache(path);
}

/**
 * Cleanup: dispose all cached models
 */
export function disposeAllAssets(): void {
  getAssetManager().clearAllCache();
}

/**
 * Get asset manager stats
 */
export function getAssetStats() {
  return getAssetManager().getStats();
}
