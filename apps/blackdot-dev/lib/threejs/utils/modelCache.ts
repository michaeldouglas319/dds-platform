/**
 * Native Model Caching Utility
 * Uses drei's built-in caching + memoization for reusability
 * Based on R3F useLoader caching and useMemo patterns
 */

import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Global cache for optimized scenes (reusable across components)
const optimizedSceneCache = new Map<string, THREE.Group>();

/**
 * Get cached optimized scene or create and cache it
 * Reusable utility for any model path
 */
function getCachedOptimizedScene(
  path: string,
  scene: THREE.Group,
  optimizeFn?: (scene: THREE.Group) => THREE.Group
): THREE.Group {
  const cacheKey = path;

  // Return cached version if available
  if (optimizedSceneCache.has(cacheKey)) {
    return optimizedSceneCache.get(cacheKey)!.clone();
  }

  // Optimize and cache
  const optimized = optimizeFn ? optimizeFn(scene.clone()) : scene.clone();
  optimizedSceneCache.set(cacheKey, optimized);

  return optimized.clone();
}

/**
 * Hook for cached model loading with native drei caching
 * Reusable across any component that needs models
 * 
 * @example
 * const model = useCachedModel('/building.glb');
 * useDispose(model);
 */
export function useCachedModel(
  path: string,
  optimizeFn?: (scene: THREE.Group) => THREE.Group
): THREE.Group {
  // Use drei's native caching (useGLTF handles caching internally)
  const { scene } = useGLTF(path);

  // Memoize optimized scene (only recompute if scene changes)
  // Note: optimizeFn is intentionally not in deps - it should be stable
  return useMemo(() => {
    return getCachedOptimizedScene(path, scene, optimizeFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, path]); // Only depend on scene and path (optimizeFn should be stable)
}

/**
 * Clear model cache (useful for memory management)
 */
export function clearModelCache(): void {
  optimizedSceneCache.forEach((scene) => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((mat) => {
            Object.keys(mat).forEach((key) => {
              const value = (mat as Record<string, unknown>)[key];
              if (value && value instanceof THREE.Texture) {
                value.dispose();
              }
            });
            mat.dispose();
          });
        }
      }
    });
  });
  optimizedSceneCache.clear();
}

/**
 * Get cache statistics
 */
export function getModelCacheStats() {
  return {
    size: optimizedSceneCache.size,
    entries: Array.from(optimizedSceneCache.keys()),
  };
}

