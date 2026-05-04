'use client';

import { useMemo, useRef, useEffect, memo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCachedModel } from '@/lib/threejs/utils/modelCache';
import { optimizeGLTFScene } from '@/lib/threejs/optimization/modelOptimization';
import { detectDeviceCapabilities, getOptimalModelOptions } from '@/lib/threejs/optimization/deviceCapability';
import { disposeModel } from '@/lib/threejs/utils/modelDisposal';
import { useModelAutoScaling } from '@/lib/threejs/utils/modelScaling';

interface BuildingModelProps {
  modelOffset: number;
}

/**
 * Building Model Component
 * Displays building 3D model with native caching and disposal
 * Memoized to prevent unnecessary re-renders
 */
export const BuildingModel = memo(function BuildingModel({ modelOffset }: BuildingModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const modelRef = useRef<THREE.Group | null>(null);

  // Device capabilities for optimization - memoized
  const deviceCapabilities = useMemo(() => detectDeviceCapabilities(), []);
  const modelOptions = useMemo(() => getOptimalModelOptions(deviceCapabilities), [deviceCapabilities]);

  // Use native cached model loading - only load once
  const model = useCachedModel('/assets/models/building.glb', (scene) => {
    return optimizeGLTFScene(scene, modelOptions) as THREE.Group;
  });

  // Store model reference to prevent re-renders
  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  // Cache WebGL context for safe access
  const webglContextRef = useRef<WebGLRenderingContext | WebGL2RenderingContext | null>(null);

  // Proper cleanup on unmount
  useEffect(() => {
    try {
      webglContextRef.current = gl.getContext() as WebGLRenderingContext | WebGL2RenderingContext | null;
      if (process.env.NODE_ENV === 'development') {
        console.debug('[BuildingModel] WebGL context initialized');
      }
    } catch (error) {
      console.error('[BuildingModel] Failed to get WebGL context:', error);
    }

    return () => {
      disposeModel(modelRef.current, webglContextRef.current, 'BuildingModel');
      modelRef.current = null;
    };
  }, [gl]);

  // Dynamic bounding box auto-scaling
  const { scale, center } = useModelAutoScaling(model, 2.5);

  // Animation using ref mutation
  useFrame((state) => {
    if (!groupRef.current) return;

    const webglContext = webglContextRef.current;
    if (webglContext && typeof webglContext.isContextLost === 'function' && !webglContext.isContextLost()) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group position={[modelOffset, 0, 0]}>
      <group
        ref={groupRef}
        scale={[scale, scale, scale]}
        position={[-center.x * scale, -center.y * scale, -center.z * scale]}
      >
        <primitive object={model} />
      </group>
    </group>
  );
});

BuildingModel.displayName = 'BuildingModel';
