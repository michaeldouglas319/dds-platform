/**
 * Reusable Resource Management Utilities
 * Native Three.js disposal patterns for R3F
 * Based on Three.js disposal guidelines and R3F best practices
 */

import * as THREE from 'three';
import { useEffect } from 'react';

/**
 * Reusable disposal hook for any Three.js resource
 * Automatically disposes geometries, materials, and textures
 * 
 * @example
 * const model = useGLTF('/model.glb');
 * useDispose(model.scene);
 * 
 * @example
 * const texture = useTexture('/texture.jpg');
 * useDispose(texture);
 */
export function useDispose(resource: THREE.Object3D | THREE.Texture | null | undefined) {
  useEffect(() => {
    if (!resource) return;

    // Handle textures directly
    if (resource instanceof THREE.Texture) {
      return () => {
        resource.dispose();
      };
    }

    // Handle Object3D (Group, Mesh, etc.)
    if (resource instanceof THREE.Object3D) {
      return () => {
        resource.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Dispose geometry
            if (child.geometry) {
              child.geometry.dispose();
            }

            // Dispose materials
            if (child.material) {
              const materials = Array.isArray(child.material)
                ? child.material
                : [child.material];

              materials.forEach((material) => {
                // Dispose all textures in material
                Object.keys(material).forEach((key) => {
                  const value = (material as Record<string, unknown>)[key];
                  if (value && value instanceof THREE.Texture) {
                    value.dispose();
                  }
                });

                // Dispose material itself
                material.dispose();
              });
            }
          }
        });
      };
    }
  }, [resource]);
}

/**
 * Dispose a resource immediately (for cleanup outside hooks)
 */
export function disposeResource(resource: THREE.Object3D | THREE.Texture | null | undefined): void {
  if (!resource) return;

  if (resource instanceof THREE.Texture) {
    resource.dispose();
    return;
  }

  if (resource instanceof THREE.Object3D) {
    resource.traverse((child) => {
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
  }
}

/**
 * Dispose multiple resources at once
 */
export function disposeResources(resources: (THREE.Object3D | THREE.Texture | null | undefined)[]): void {
  resources.forEach(disposeResource);
}




