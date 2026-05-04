/**
 * Model Disposal Utilities
 * Handles proper cleanup of Three.js models and WebGL resources
 */

import * as THREE from 'three';

/**
 * Disposes of all WebGL resources associated with a model
 * Handles geometries, materials, textures, and WebGL context loss
 *
 * @param model - The Three.js model to dispose
 * @param gl - The WebGL renderer context
 * @param componentName - Name for console logging (development only)
 */
export function disposeModel(
  model: THREE.Group | null | undefined,
  gl: WebGLRenderingContext | WebGL2RenderingContext | null,
  componentName: string = 'Model'
): void {
  if (!model) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[ModelDisposal] ${componentName}: Skipped (model is null/undefined)`);
    }
    return;
  }

  const isDev = process.env.NODE_ENV === 'development';
  let geometriesDisposed = 0;
  let materialsDisposed = 0;
  let texturesDisposed = 0;

  try {
    // Enhanced context checking
    const webglContext = gl as WebGLRenderingContext | WebGL2RenderingContext | null;

    // Log context status
    if (isDev) {
      const contextStatus =
        webglContext === null ? 'null' :
        webglContext === undefined ? 'undefined' :
        typeof webglContext.isContextLost !== 'function' ? 'missing isContextLost method' :
        webglContext.isContextLost() ? 'lost' : 'active';
      console.debug(`[ModelDisposal] ${componentName}: WebGL context status = ${contextStatus}`);
    }

    // Safe context check - use optional chaining to avoid errors
    const isContextAvailable = webglContext && typeof webglContext.isContextLost === 'function' && !webglContext.isContextLost();

    if (isContextAvailable) {
      if (isDev) {
        console.debug(`[ModelDisposal] ${componentName}: Starting disposal with active WebGL context`);
      }

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Dispose geometry
          if (child.geometry) {
            child.geometry.dispose();
            geometriesDisposed++;
          }

          // Dispose materials and textures
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat) => {
              // Dispose all textures
              Object.keys(mat).forEach((key) => {
                const value = (mat as Record<string, unknown>)[key];
                if (value && value instanceof THREE.Texture) {
                  try {
                    value.dispose();
                    texturesDisposed++;
                  } catch (texError) {
                    if (isDev) {
                      console.warn(`[ModelDisposal] ${componentName}: Failed to dispose texture "${key}":`, texError);
                    }
                  }
                }
              });

              // Dispose material
              try {
                mat.dispose();
                materialsDisposed++;
              } catch (matError) {
                if (isDev) {
                  console.warn(`[ModelDisposal] ${componentName}: Failed to dispose material:`, matError);
                }
              }
            });
          }
        }
      });

      if (isDev) {
        console.debug(
          `[ModelDisposal] ${componentName}: Successfully disposed ` +
          `${geometriesDisposed} geometries, ${materialsDisposed} materials, ${texturesDisposed} textures`
        );
      }
    } else {
      if (isDev) {
        console.info(
          `[ModelDisposal] ${componentName}: Skipped WebGL disposal ` +
          `(context unavailable or lost). Still disposing CPU-side resources...`
        );
      }

      // Still traverse and dispose what we can
      model.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          try {
            child.geometry.dispose();
            geometriesDisposed++;
          } catch (geoError) {
            if (isDev) {
              console.warn(`[ModelDisposal] ${componentName}: Failed to dispose geometry:`, geoError);
            }
          }
        }
      });

      if (isDev) {
        console.debug(
          `[ModelDisposal] ${componentName}: Disposed ${geometriesDisposed} geometries ` +
          `(GPU resources skipped - context unavailable)`
        );
      }
    }
  } catch (error) {
    if (isDev) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';

      console.error(
        `[ModelDisposal] ${componentName}: Critical disposal error`,
        {
          message: errorMessage,
          stack: errorStack,
          disposed: {
            geometries: geometriesDisposed,
            materials: materialsDisposed,
            textures: texturesDisposed
          }
        }
      );
    }
  }
}
