/**
 * Camera Positioning Utilities
 * Automatically compute optimal camera positions based on model bounds
 * Ensures models are always properly framed regardless of size
 *
 * Key function: computes camera distance to fit entire model in view
 */

import * as THREE from 'three';
import type { BoundingBoxInfo, CameraConfig } from '../models/types';

/**
 * Compute the optimal camera distance to frame a model
 * Takes into account FOV and model bounds
 *
 * Math: camera_distance = (model_height / 2) / tan(fov / 2)
 * Then multiply by padding factor for comfortable viewing
 */
export function computeCameraDistance(
  bounds: BoundingBoxInfo,
  fov: number = 75,
  padding: number = 1.2
): number {
  // Convert FOV to radians
  const vFOV = (fov * Math.PI) / 180;

  // Get the largest dimension to ensure we fit the whole model
  const maxDim = Math.max(bounds.width, bounds.height, bounds.depth);

  // Calculate required distance: distance = (size / 2) / tan(fov / 2)
  const distance = (maxDim / 2) / Math.tan(vFOV / 2);

  // Apply padding for comfortable viewing space
  return distance * padding;
}

/**
 * Compute optimal camera position given a target point and bounds
 * Positions camera to look at model from a comfortable angle
 */
export function computeCameraPosition(
  bounds: BoundingBoxInfo,
  direction: 'front' | 'isometric' | 'top' | 'side' = 'isometric',
  distance?: number,
  fov: number = 75
): [number, number, number] {
  const d = distance ?? computeCameraDistance(bounds, fov);
  const center = bounds.center;

  const positions: Record<string, [number, number, number]> = {
    front: [center[0], center[1], center[2] + d],
    isometric: [d * 0.707, d * 0.5, d * 0.707], // 45° angle, elevated
    top: [center[0], center[1] + d, center[2]],
    side: [center[0] + d, center[1], center[2]],
  };

  return positions[direction] || positions.isometric;
}

/**
 * Compute camera config that frames a model
 * Returns complete camera setup with position, target, and FOV
 */
export function computeFramingCamera(
  bounds: BoundingBoxInfo,
  options: {
    direction?: 'front' | 'isometric' | 'top' | 'side';
    fov?: number;
    padding?: number;
    offsetY?: number; // Extra vertical offset
  } = {}
): CameraConfig {
  const { direction = 'isometric', fov = 75, padding = 1.2, offsetY = 0 } = options;

  const distance = computeCameraDistance(bounds, fov, padding);
  const position = computeCameraPosition(bounds, direction, distance, fov);

  // Apply Y offset if specified
  const adjustedPosition: [number, number, number] = [
    position[0],
    position[1] + offsetY,
    position[2],
  ];

  return {
    position: adjustedPosition,
    target: bounds.center,
    fov,
    distance,
  };
}

/**
 * Compute viewport-aware camera distance
 * Adjusts camera distance based on screen aspect ratio
 * Ensures proper framing on different screen sizes
 */
export function computeResponsiveCameraDistance(
  bounds: BoundingBoxInfo,
  viewportWidth: number,
  viewportHeight: number,
  fov: number = 75,
  padding: number = 1.2
): number {
  // For portrait screens, may need extra distance
  const aspectRatio = viewportWidth / viewportHeight;
  const aspectAdjustment = Math.min(1.2, Math.max(0.9, 1 / aspectRatio));

  const baseDistance = computeCameraDistance(bounds, fov, padding);
  return baseDistance * aspectAdjustment;
}

/**
 * Smooth camera transition
 * Lerps camera position and target over time
 */
export function lerpCamera(
  camera: THREE.Camera,
  from: CameraConfig,
  to: CameraConfig,
  t: number // 0-1, interpolation factor
): void {
  if (!(camera instanceof THREE.PerspectiveCamera)) return;

  // Interpolate position
  const pos = new THREE.Vector3(
    THREE.MathUtils.lerp(from.position[0], to.position[0], t),
    THREE.MathUtils.lerp(from.position[1], to.position[1], t),
    THREE.MathUtils.lerp(from.position[2], to.position[2], t)
  );
  camera.position.copy(pos);

  // Interpolate target (look-at point)
  const targetPos = new THREE.Vector3(
    THREE.MathUtils.lerp(from.target[0], to.target[0], t),
    THREE.MathUtils.lerp(from.target[1], to.target[1], t),
    THREE.MathUtils.lerp(from.target[2], to.target[2], t)
  );
  camera.lookAt(targetPos);
}

/**
 * Compute camera for scrollable view
 * Positions camera for a vertical scroll through multiple objects
 */
export function computeScrollCamera(
  bounds: BoundingBoxInfo,
  scrollProgress: number, // 0-1
  direction: 'vertical' | 'horizontal' = 'vertical'
): CameraConfig {
  const distance = computeCameraDistance(bounds, 75, 1.3);

  let position: [number, number, number];
  let target: [number, number, number] = bounds.center;

  if (direction === 'vertical') {
    // Pan camera vertically with scroll
    const verticalPan = bounds.height * scrollProgress;
    position = [distance * 0.707, verticalPan, distance * 0.707];
    target = [0, verticalPan, 0];
  } else {
    // Pan camera horizontally with scroll
    const horizontalPan = bounds.width * scrollProgress;
    position = [horizontalPan + distance * 0.707, distance * 0.5, distance * 0.707];
    target = [horizontalPan, 0, 0];
  }

  return {
    position,
    target,
    fov: 75,
    distance,
  };
}

/**
 * Ensure camera can see model
 * Validates that model is in camera frustum
 */
export function validateCameraView(
  camera: THREE.PerspectiveCamera,
  bounds: BoundingBoxInfo
): boolean {
  const frustum = new THREE.Frustum();
  frustum.setFromProjectionMatrix(
    new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    )
  );

  const boundingSphere = new THREE.Sphere(
    new THREE.Vector3(...bounds.center),
    bounds.radius
  );

  return frustum.intersectsSphere(boundingSphere);
}

/**
 * Compute multiple camera angles for inspection
 * Useful for orbit controls or multi-view showcases
 */
export function computeInspectionCameras(
  bounds: BoundingBoxInfo,
  numAngles: number = 4
): CameraConfig[] {
  const cameras: CameraConfig[] = [];
  const angleStep = (Math.PI * 2) / numAngles;

  const distance = computeCameraDistance(bounds, 75, 1.2);
  const elevationAngle = Math.PI / 6; // 30° elevation

  for (let i = 0; i < numAngles; i++) {
    const horizontalAngle = i * angleStep;

    const position: [number, number, number] = [
      Math.cos(horizontalAngle) * distance,
      Math.sin(elevationAngle) * distance * 0.5,
      Math.sin(horizontalAngle) * distance,
    ];

    cameras.push({
      position,
      target: bounds.center,
      fov: 75,
      distance,
    });
  }

  return cameras;
}

/**
 * Compute camera for first-person/walkthrough view
 * Position camera near model to explore closely
 */
export function computeWalkthroughCamera(
  bounds: BoundingBoxInfo,
  position: [number, number, number],
  lookOffset: [number, number, number] = [0, 0, 1]
): CameraConfig {
  return {
    position,
    target: [
      position[0] + lookOffset[0],
      position[1] + lookOffset[1],
      position[2] + lookOffset[2],
    ],
    fov: 90, // Wider FOV for first-person
    distance: 0,
  };
}
