/**
 * Native Texture Caching Utility
 * Reuses Three.js Texture API for memory efficiency
 * Based on Three.js texture sharing patterns
 */

import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Global cache for shared textures (reusable across materials)
const textureCache = new Map<string, THREE.Texture>();

/**
 * Hook for cached texture loading with native drei caching
 * Automatically configures mipmaps and filters
 * Reusable across any component that needs textures
 * 
 * @example
 * const texture = useCachedTexture('/texture.jpg');
 * const material = new THREE.MeshStandardMaterial({ map: texture });
 * useDispose(texture);
 */
export function useCachedTexture(
  path: string,
  options?: {
    generateMipmaps?: boolean;
    minFilter?: THREE.TextureFilter;
    magFilter?: THREE.MagnificationTextureFilter;
    anisotropy?: number;
  }
): THREE.Texture {
  const {
    generateMipmaps = true,
    minFilter = THREE.LinearMipmapLinearFilter,
    magFilter = THREE.LinearFilter,
    anisotropy = 4,
  } = options || {};

  // Use drei's native caching (useTexture handles caching internally)
  const texture = useTexture(
    path,
    (texture) => {
      // Configure texture settings natively
      texture.generateMipmaps = generateMipmaps;
      texture.minFilter = minFilter;
      texture.magFilter = magFilter;
      texture.anisotropy = Math.min(anisotropy, texture.anisotropy || 1);
    }
  );

  // Return cached texture instance (drei already caches, this ensures reuse)
  return useMemo(() => {
    // drei's useTexture already handles caching, but we can track it
    if (!textureCache.has(path)) {
      textureCache.set(path, texture);
    }
    return textureCache.get(path)!;
  }, [texture, path]);
}

/**
 * Clear texture cache
 */
export function clearTextureCache(): void {
  textureCache.forEach((texture) => {
    texture.dispose();
  });
  textureCache.clear();
}




