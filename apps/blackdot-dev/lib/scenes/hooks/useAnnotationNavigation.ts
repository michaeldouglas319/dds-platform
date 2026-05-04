/**
 * Hook for annotation navigation with camera animation
 * Based on the standard pattern using maath/easing for smooth transitions
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import * as THREE from 'three';
import type { AnnotationData } from '@/lib/types/annotation.types';

interface UseAnnotationNavigationOptions {
  annotations: AnnotationData[];
  duration?: number; // Animation duration in seconds
}

export function useAnnotationNavigation({
  annotations,
  duration = 1.0,
}: UseAnnotationNavigationOptions) {
  const { camera, previousRoot } = useThree();
  const isPortal = !!previousRoot; // Detect if we're in a portal
  const targetPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const isAnimatingRef = useRef(false);
  const currentAnnotationRef = useRef<string | null>(null);
  const [currentAnnotation, setCurrentAnnotation] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize camera position - DISABLED in portal mode
  useEffect(() => {
    // Don't manipulate camera in portal mode - portals have their own camera
    if (isPortal) return;
    
    if (annotations.length > 0) {
      const first = annotations[0];
      targetPositionRef.current.set(first.camPos.x, first.camPos.y, first.camPos.z);
      targetLookAtRef.current.set(first.lookAt.x, first.lookAt.y, first.lookAt.z);
      camera.position.copy(targetPositionRef.current);
      camera.lookAt(targetLookAtRef.current);
    }
  }, [isPortal, annotations, camera]);

  // Smooth camera animation using maath easing
  // DISABLED in portal mode to prevent conflicts with overview camera
  useFrame((state, delta) => {
    // Don't manipulate camera in portal mode
    if (isPortal) return;
    
    // Smoothly interpolate camera position
    easing.damp3(camera.position, targetPositionRef.current, 0.4, delta);

    // Calculate look-at direction
    const direction = new THREE.Vector3()
      .subVectors(targetLookAtRef.current, camera.position)
      .normalize();

    // Smoothly rotate camera to look at target
    const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, -1),
      direction
    );
    easing.dampQ(camera.quaternion, targetQuaternion, 0.4, delta);

    // Check if animation is complete (within threshold)
    if (isAnimatingRef.current) {
      const distance = camera.position.distanceTo(targetPositionRef.current);
      if (distance < 0.01) {
        isAnimatingRef.current = false;
        setIsAnimating(false);
      }
    }
  });

  const navigateTo = useCallback(
    (id: string) => {
      const annotation = annotations.find((a) => a.id === id);
      if (!annotation) {
        console.warn(`Annotation not found: ${id}`);
        return;
      }

      currentAnnotationRef.current = id;
      isAnimatingRef.current = true;
      setCurrentAnnotation(id);
      setIsAnimating(true);

      // Set target position and look-at
      targetPositionRef.current.set(
        annotation.camPos.x,
        annotation.camPos.y,
        annotation.camPos.z
      );
      targetLookAtRef.current.set(
        annotation.lookAt.x,
        annotation.lookAt.y,
        annotation.lookAt.z
      );
    },
    [annotations]
  );

  return {
    navigateTo,
    currentAnnotation,
    isAnimating,
  };
}

