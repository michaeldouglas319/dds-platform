'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Hook for managing 3D model interactions
 *
 * Provides:
 * - Mouse/touch position tracking
 * - Raycasting for part selection
 * - Collision detection
 * - Gesture detection (future)
 * - Particle interaction (future)
 *
 * @example
 * ```tsx
 * const modelInteraction = useModelInteraction();
 *
 * // Get mouse position in world space
 * const worldPos = modelInteraction.getWorldPosition(event);
 *
 * // Raycast to find intersected objects
 * const intersects = modelInteraction.raycast(targetObject);
 *
 * // Enable particle interaction
 * modelInteraction.enableParticles(true);
 *
 * // Check distance to interaction point
 * const distance = modelInteraction.getDistance(mesh, worldPos);
 * ```
 */
export function useModelInteraction() {
  const { camera, scene, raycaster, mouse } = useThree();
  const modelRef = useRef<THREE.Group | null>(null);
  const [selectedPart, setSelectedPart] = useState<THREE.Object3D | null>(null);
  const [particlesEnabled, setParticlesEnabled] = useState(false);
  const [interactionPoint, setInteractionPoint] = useState(new THREE.Vector3());

  // Track mouse position
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const canvas = (event.target as HTMLElement).closest('canvas') as HTMLCanvasElement;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster position
      raycaster.setFromCamera(mouse, camera);

      // Store world position for particle interactions
      const planeZ = -5;
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), planeZ);
      raycaster.ray.intersectPlane(plane, interactionPoint);
    },
    [camera, mouse, raycaster, interactionPoint]
  );

  // Track touch position
  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (event.touches.length === 0) return;

      const canvas = (event.target as HTMLElement).closest('canvas') as HTMLCanvasElement;
      if (!canvas) return;

      const touch = event.touches[0];
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
    },
    [camera, mouse, raycaster]
  );

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleMouseMove, handleTouchMove]);

  // Raycast to find intersected parts
  const raycast = useCallback(
    (targetObject?: THREE.Object3D) => {
      const target = targetObject || modelRef.current;
      if (!target) return [];

      return raycaster.intersectObject(target, true);
    },
    [raycaster]
  );

  // Get world position from screen coordinates
  const getWorldPosition = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const canvas = (event.target as HTMLElement).closest('canvas') as HTMLCanvasElement;
      if (!canvas) return new THREE.Vector3();

      let clientX: number, clientY: number;

      if (event instanceof MouseEvent) {
        clientX = event.clientX;
        clientY = event.clientY;
      } else {
        const touch = event.touches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      }

      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;

      const vector = new THREE.Vector3(x, y, 0.5);
      vector.unproject(camera);

      const direction = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / direction.z;

      return camera.position.clone().add(direction.multiplyScalar(distance));
    },
    [camera]
  );

  // Calculate distance from mesh to a point
  const getDistance = useCallback(
    (mesh: THREE.Mesh, point: THREE.Vector3): number => {
      const bbox = new THREE.Box3().setFromObject(mesh);
      const closest = new THREE.Vector3();
      bbox.clampPoint(point, closest);
      return point.distanceTo(closest);
    },
    []
  );

  // Select a part by raycasting
  const selectPart = useCallback(() => {
    const intersects = raycast();
    if (intersects.length > 0) {
      setSelectedPart(intersects[0].object);
      return intersects[0].object;
    }
    setSelectedPart(null);
    return null;
  }, [raycast]);

  return {
    // References
    modelRef,
    selectedPart,

    // State
    particlesEnabled,
    setParticlesEnabled,
    interactionPoint,

    // Methods
    raycast,
    getWorldPosition,
    getDistance,
    selectPart,

    // Utility
    mouse,
    raycaster,
  };
}

export type UseModelInteraction = ReturnType<typeof useModelInteraction>;
