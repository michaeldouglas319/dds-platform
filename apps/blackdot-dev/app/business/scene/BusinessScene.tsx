'use client'

import { Suspense, useRef, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import * as THREE from 'three';
import { buildingAnnotations } from '../config/annotations.config';
import { AnnotationMarkers } from '@/lib/scenes/components/shared/AnnotationMarkers';
import { useAnnotationNavigation } from '@/lib/scenes/hooks/useAnnotationNavigation';
import { registerNavigation } from '../context/AnnotationContext';
import { useSceneContext } from '../context/SceneContext';
import { useCachedModel } from '@/lib/threejs/utils/modelCache';
import { useDispose } from '@/lib/threejs/utils/resource';
import { optimizeGLTFScene } from '@/lib/threejs/optimization/modelOptimization';
import { detectDeviceCapabilities, getOptimalModelOptions } from '@/lib/threejs/optimization/deviceCapability';

/**
 * Business Scene Component
 * Displays a building model with annotation navigation.
 * Optimized for performance with automatic model optimization.
 */
function BuildingModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { previousRoot } = useThree();
  
  // Detect if we're in a portal (Frame card)
  const isPortal = !!previousRoot;
  
  // Frame height is 1.61803398875, half is ~0.809
  // Shift scene up by half view height to position floor at bottom of card
  const portalOffsetY = isPortal ? -1 : 0;

  // Load GLTF building model with native caching
  const gltfPath = '/assets/models/building.glb';
  
  // Detect device capabilities for optimal settings
  const deviceCapabilities = useMemo(() => detectDeviceCapabilities(), []);
  const modelOptions = useMemo(() => getOptimalModelOptions(deviceCapabilities), [deviceCapabilities]);

  // Use native cached model loading with optimization
  const optimizedScene = useCachedModel(gltfPath, (scene) => {
    return optimizeGLTFScene(scene, modelOptions) as THREE.Group;
  });

  // Native disposal hook (reusable pattern)
  useDispose(optimizedScene);

  // Calculate scale to fit model appropriately
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(optimizedScene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    return 1.5 / maxDim; // Scale to fit in ~1.5 unit space
  }, [optimizedScene]);

  return (
    <Center position={[0, portalOffsetY, -1]}>
      <group ref={groupRef} scale={[scale, scale, scale]}>
        <primitive object={optimizedScene} />
      </group>
    </Center>
  );
}

export function BusinessScene() {
  const { showAnnotations } = useSceneContext();
  const isPortal = useThree().previousRoot !== null;
  const deviceCapabilities = useMemo(() => detectDeviceCapabilities(), []);
  const modelOptions = useMemo(() => getOptimalModelOptions(deviceCapabilities), [deviceCapabilities]);

  // Initialize annotation navigation (only in detail mode)
  const { navigateTo } = useAnnotationNavigation({ 
    annotations: buildingAnnotations,
  });

  // Register navigation function so it can be accessed from outside Canvas
  useEffect(() => {
    if (!isPortal) {
      registerNavigation(navigateTo);
    }
  }, [navigateTo, isPortal]);

  return (
    <>
      {/* Optimized Lighting - Reduced from 4 to 2 lights */}
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1.0} 
        castShadow={modelOptions.enableShadows}
      />

      {/* Load building model */}
      <Suspense fallback={null}>
        <BuildingModel />
      </Suspense>

      {/* Annotation Markers - only visible in detail mode, not in overview */}
      {showAnnotations && !isPortal && (
        <AnnotationMarkers annotations={buildingAnnotations} visible={true} />
      )}
    </>
  );
}

