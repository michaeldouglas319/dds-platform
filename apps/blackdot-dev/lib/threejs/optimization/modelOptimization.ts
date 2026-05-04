/**
 * GLTF Model Optimization Utilities
 * Optimizes loaded models based on device capabilities
 */

import * as THREE from 'three';
import { ModelOptimizationOptions } from './deviceCapability';

// Re-export for convenience
export type { ModelOptimizationOptions };

/**
 * Optimize a loaded GLTF scene based on device capabilities
 * Accepts both Scene and Group (GLTF root is typically a Group)
 */
export function optimizeGLTFScene(
  scene: THREE.Scene | THREE.Group,
  options: ModelOptimizationOptions
): THREE.Scene | THREE.Group {
  // Clone the scene/group to avoid modifying the original
  const optimizedScene = scene.clone();

  // Apply optimizations
  optimizeTextures(optimizedScene, options);
  optimizeGeometry(optimizedScene, options);
  optimizeMaterials(optimizedScene, options);

  // Remove unnecessary components
  if (options.skipNormals) {
    removeNormals(optimizedScene);
  }

  // Optimize scene graph
  mergeStaticGeometries(optimizedScene, options);

  return optimizedScene;
}

/**
 * Optimize textures in the scene
 */
function optimizeTextures(scene: THREE.Scene | THREE.Group, options: ModelOptimizationOptions): void {
  if (options.skipTextures) {
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh && node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((mat) => {
          // Skip texture-based materials
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.map = null;
            mat.normalMap = null;
            mat.roughnessMap = null;
            mat.metalnessMap = null;
          }
        });
      }
    });
  } else {
    // Downscale textures for lower-end devices
    scene.traverse((node) => {
      if (node instanceof THREE.Mesh && node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((mat) => {
          // Downscale map textures
          if (mat instanceof THREE.MeshStandardMaterial) {
            const texturesToOptimize = [mat.map, mat.normalMap, mat.roughnessMap, mat.metalnessMap];
            texturesToOptimize.forEach((texture) => {
              if (texture) {
                optimizeTexture(texture, options.maxTextureSize);
              }
            });
          }
        });
      }
    });
  }
}

/**
 * Check if texture image has width/height properties
 */
function isImageWithDimensions(image: unknown): image is { width: number; height: number } {
  return (
    typeof image === 'object' &&
    image !== null &&
    'width' in image &&
    'height' in image &&
    typeof (image as Record<string, unknown>).width === 'number' &&
    typeof (image as Record<string, unknown>).height === 'number'
  );
}

/**
 * Optimize individual texture
 */
function optimizeTexture(texture: THREE.Texture, maxSize: number): void {
  if (!texture.image || !isImageWithDimensions(texture.image)) return;

  const width = texture.image.width;
  const height = texture.image.height;

  // Only downscale if larger than max size
  if (width > maxSize || height > maxSize) {
    const scale = Math.min(1, maxSize / Math.max(width, height));
    const newWidth = Math.floor(width * scale);
    const newHeight = Math.floor(height * scale);

    // Create canvas and resize
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext('2d');
    if (ctx && (texture.image instanceof HTMLImageElement || texture.image instanceof HTMLCanvasElement)) {
      ctx.drawImage(texture.image as CanvasImageSource, 0, 0, newWidth, newHeight);
      texture.image = canvas as unknown as TexImageSource;
      texture.needsUpdate = true;
    }
  }
}

/**
 * Optimize geometry in the scene
 */
function optimizeGeometry(scene: THREE.Scene | THREE.Group, options: ModelOptimizationOptions): void {
  let geometryCount = 0;

  scene.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      geometryCount++;

      const geometry = node.geometry;
      if (geometry instanceof THREE.BufferGeometry) {
        // Remove unused attributes
        if (options.skipNormals && geometry.getAttribute('normal')) {
          geometry.deleteAttribute('normal');
        }

        // Optimize index
        if (geometry.index) {
          const indexArray = geometry.index.array;
          // Force proper index type
          if (indexArray.length > 65536 && !(indexArray instanceof Uint32Array)) {
            // Convert to Uint32Array if needed
            const newIndex = new Uint32Array(indexArray);
            geometry.setIndex(new THREE.BufferAttribute(newIndex, 1));
          }
        }

        // Compact the geometry - attributes compacted above
      }
    }
  });

  // Warn if too many geometries
  if (geometryCount > options.maxGeometries && process.env.NODE_ENV === 'development') {
    console.warn(
      `Model has ${geometryCount} geometries, which exceeds limit of ${options.maxGeometries}. Consider optimizing the model.`
    );
  }
}

/**
 * Remove normal maps from materials
 */
function removeNormals(scene: THREE.Scene | THREE.Group): void {
  scene.traverse((node) => {
    if (node instanceof THREE.Mesh && node.material) {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((mat) => {
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.normalMap = null;
        } else if (mat instanceof THREE.MeshPhongMaterial) {
          mat.normalMap = null;
        }
      });
    }
  });
}

/**
 * Optimize materials in the scene
 */
function optimizeMaterials(scene: THREE.Scene | THREE.Group, options: ModelOptimizationOptions): void {
  scene.traverse((node) => {
    if (node instanceof THREE.Mesh && node.material) {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((mat) => {
        // Disable features on low-end devices
        if (options.textureDensity === 'low') {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.envMap = null;
            mat.lightMap = null;
            mat.aoMap = null;
          }
          mat.flatShading = true;
        }

        // Disable shadows on low-end devices
        if (!options.enableShadows) {
          mat.shadowSide = THREE.BackSide;
          mat.castShadow = false;
          mat.receiveShadow = false;
        }
      });
    }
  });
}

/**
 * Merge static geometries to reduce draw calls
 */
function mergeStaticGeometries(scene: THREE.Scene | THREE.Group, options: ModelOptimizationOptions): void {
  if (!options.mergeGeometries) return;

  // Collect static meshes by material
  const meshesByMaterial: Map<THREE.Material, THREE.Mesh[]> = new Map();

  scene.traverse((node) => {
    if (node instanceof THREE.Mesh && !(node.parent instanceof THREE.SkinnedMesh)) {
      const material = Array.isArray(node.material) ? node.material[0] : node.material;
      if (!meshesByMaterial.has(material)) {
        meshesByMaterial.set(material, []);
      }
      meshesByMaterial.get(material)!.push(node);
    }
  });

  // Merge meshes with same material (if group has multiple meshes)
  let mergedCount = 0;
  meshesByMaterial.forEach((meshes, material) => {
    if (meshes.length > 1) {
      // Only merge if there are multiple meshes
      const geometries: THREE.BufferGeometry[] = [];
      const matrices: THREE.Matrix4[] = [];

      meshes.forEach((mesh) => {
        geometries.push(mesh.geometry);
        matrices.push(mesh.matrixWorld);
      });

      // Create merged geometry
      try {
        const mergedGeometry = mergeGeometries(geometries, matrices);
        if (mergedGeometry) {
          // Remove original meshes
          meshes.forEach((mesh) => {
            mesh.parent?.remove(mesh);
          });

          // Add merged mesh
          const mergedMesh = new THREE.Mesh(mergedGeometry, material);
          scene.add(mergedMesh);
          mergedCount++;
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to merge geometries:', e);
        }
      }
    }
  });

  if (mergedCount > 0 && process.env.NODE_ENV === 'development') {
    console.log(`Merged ${mergedCount} geometry groups`);
  }
}

/**
 * Helper function to merge multiple geometries
 */
function mergeGeometries(
  geometries: THREE.BufferGeometry[],
  matrices: THREE.Matrix4[]
): THREE.BufferGeometry | null {
  if (geometries.length === 0) return null;

  const merged = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];

  const vOffset = new THREE.Vector3();
  const nOffset = new THREE.Vector3();

  geometries.forEach((geometry, i) => {
    const posAttr = geometry.getAttribute('position');
    const normAttr = geometry.getAttribute('normal');
    const colorAttr = geometry.getAttribute('color');

    if (posAttr) {
      const matrix = matrices[i];
      const position = posAttr.array as Float32Array;

      for (let j = 0; j < position.length; j += 3) {
        vOffset.set(position[j], position[j + 1], position[j + 2]);
        vOffset.applyMatrix4(matrix);
        positions.push(vOffset.x, vOffset.y, vOffset.z);
      }

      if (normAttr && positions.length > 0) {
        const normal = normAttr.array as Float32Array;
        for (let j = 0; j < normal.length; j += 3) {
          nOffset.set(normal[j], normal[j + 1], normal[j + 2]);
          nOffset.applyMatrix3(new THREE.Matrix3().getNormalMatrix(matrix));
          normals.push(nOffset.x, nOffset.y, nOffset.z);
        }
      }

      if (colorAttr) {
        const color = colorAttr.array as Float32Array;
        colors.push(...Array.from(color));
      }
    }
  });

  if (positions.length > 0) {
    merged.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

    if (normals.length === positions.length) {
      merged.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    } else {
      merged.computeVertexNormals();
    }

    if (colors.length === positions.length) {
      merged.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    }
  }

  return merged;
}
