'use client';

import * as THREE from 'three';
import { useMemo } from 'react';

export interface ModelScalingResult {
  scale: number;
  center: THREE.Vector3;
  boundingBox: THREE.Box3;
}

/**
 * Calculate automatic model scaling to fit target size
 * Uses bounding box to ensure consistent sizing regardless of model dimensions
 * Extracted from Resume V3 gold standard pattern (ScrollBasedResumeScene.tsx:266-286)
 *
 * @param scene - Three.js scene/object to scale
 * @param targetSize - Target size in world units (default: 2.5)
 * @returns Scaling info with scale factor and center offset
 *
 * @example
 * const { scale, center } = useModelAutoScaling(scene, 2.5);
 *
 * return (
 *   <group position={[modelOffset, 0, 0]}>
 *     <primitive
 *       object={model}
 *       scale={[scale, scale, scale]}
 *       position={[-center.x * scale, -center.y * scale, -center.z * scale]}
 *     />
 *   </group>
 * );
 */
export function useModelAutoScaling(
  scene: THREE.Object3D,
  targetSize: number = 2.5
): ModelScalingResult {
  return useMemo(() => {
    // Calculate bounding box of entire scene
    const box = new THREE.Box3().setFromObject(scene);

    // Get center point of bounding box
    const centerVec = box.getCenter(new THREE.Vector3());

    // Get size of bounding box
    const size = box.getSize(new THREE.Vector3());

    // Find largest dimension to ensure model fits in target size
    const maxDim = Math.max(size.x, size.y, size.z);

    // Calculate scale factor to fit model in target size
    const scaleValue = targetSize / maxDim;

    return {
      scale: scaleValue,
      center: centerVec,
      boundingBox: box
    };
  }, [scene, targetSize]);
}

/**
 * Calculate aspect ratio from texture for 2D logo models
 * Useful for maintaining proportions on plane geometry models
 *
 * @param texture - Three.js texture
 * @returns Aspect ratio (width / height)
 *
 * @example
 * const aspectRatio = getTextureAspectRatio(texture);
 * const logoWidth = 2.5;
 * const logoHeight = logoWidth / aspectRatio;
 */
export function getTextureAspectRatio(texture: THREE.Texture): number {
  const img = texture.image as HTMLImageElement | undefined;
  if (img?.width && img.height) {
    return img.width / img.height;
  }
  return 1;
}
