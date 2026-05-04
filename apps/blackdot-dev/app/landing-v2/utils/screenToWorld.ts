import * as THREE from 'three';
import { Camera } from '@react-three/fiber';

/**
 * Project 2D screen coordinates to 3D world space
 * Uses the camera's unproject method to find where a screen point exists in 3D
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: Camera,
  canvas: HTMLCanvasElement
): THREE.Vector3 {
  // Normalize screen coordinates to [-1, 1] range
  const x = (screenX / canvas.width) * 2 - 1;
  const y = -(screenY / canvas.height) * 2 + 1; // Flip Y axis
  
  // Create a vector in normalized device coordinates
  const vector = new THREE.Vector3(x, y, 0.5); // Z = 0.5 is mid-depth
  
  // Unproject to world space
  vector.unproject(camera);
  
  return vector;
}

/**
 * Get the 3D position behind a DOM element
 * Finds where the text element exists in 3D space relative to camera
 */
export function getElementWorldPosition(
  element: HTMLElement,
  camera: Camera,
  canvas: HTMLCanvasElement,
  depth: number = 0.5
): THREE.Vector3 {
  const rect = element.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  
  // Get center of element relative to canvas
  const centerX = rect.left + rect.width / 2 - canvasRect.left;
  const centerY = rect.top + rect.height / 2 - canvasRect.top;
  
  // Project to world space
  const worldPos = screenToWorld(centerX, centerY, camera, canvas);
  
  // Adjust depth - move back along camera's forward vector
  const cameraForward = new THREE.Vector3(0, 0, -1);
  cameraForward.applyQuaternion(camera.quaternion);
  worldPos.add(cameraForward.multiplyScalar(depth));
  
  return worldPos;
}

/**
 * Elastic easing function for organic scale animation
 * Creates a "pop" effect with slight overshoot
 */
export function elasticOut(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * Ease-out cubic for smooth transitions
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}



