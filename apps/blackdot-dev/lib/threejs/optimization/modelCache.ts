/**
 * Model Cache Utility
 * Prevents re-loading and re-optimizing the same models
 */

import * as THREE from 'three';
import { optimizeGLTFScene, ModelOptimizationOptions } from './modelOptimization';
import { detectDeviceCapabilities, getOptimalModelOptions } from './deviceCapability';

interface CachedModel {
  scene: THREE.Group | THREE.Scene;
  optimized: THREE.Group | THREE.Scene;
  deviceTier: string;
  timestamp: number;
}

class ModelCache {
  private cache = new Map<string, CachedModel>();
  private readonly MAX_CACHE_SIZE = 10; // Max cached models
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get or create optimized model
   */
  getOptimized(path: string, originalScene: THREE.Group): THREE.Group {
    const deviceCapabilities = detectDeviceCapabilities();
    const deviceTier = deviceCapabilities.quality || 'medium';
    const cacheKey = `${path}-${deviceTier}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      // Return cloned version (don't mutate cached)
      // Cast to Group since GLTF root is typically a Group, not a Scene
      return (cached.optimized instanceof THREE.Group ? cached.optimized : (cached.optimized as unknown as THREE.Group)).clone();
    }

    // Optimize and cache
    const modelOptions = getOptimalModelOptions(deviceCapabilities);
    const optimized = optimizeGLTFScene(originalScene.clone(), modelOptions);

    // Cache it
    this.cache.set(cacheKey, {
      scene: originalScene,
      optimized,
      deviceTier,
      timestamp: Date.now(),
    });

    // Enforce cache size limit
    this.enforceCacheLimit();

    // Cast to Group since we expect GLTF models to return Groups
    return (optimized instanceof THREE.Group ? optimized : (optimized as unknown as THREE.Group)).clone();
  }

  /**
   * Clear old or excess cache entries
   */
  private enforceCacheLimit(): void {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return;
    
    // Remove oldest entries
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => {
      const cached = this.cache.get(key);
      if (cached) {
        // Dispose resources before removing
        cached.optimized.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
              const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
              mats.forEach((mat) => {
                Object.keys(mat).forEach((key) => {
                  const value = (mat as THREE.Material & Record<string, unknown>)[key];
                  if (value && value instanceof THREE.Texture) {
                    value.dispose();
                  }
                });
                mat.dispose();
              });
            }
          }
        });
      }
      this.cache.delete(key);
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.forEach((cached) => {
      cached.optimized.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((mat) => mat.dispose());
          }
        }
      });
    });
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const modelCache = new ModelCache();




