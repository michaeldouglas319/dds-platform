'use client';

import { useMemo, useRef, useEffect, memo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCachedModel } from '@/lib/threejs/utils/modelCache';
import { optimizeGLTFScene } from '@/lib/threejs/optimization/modelOptimization';
import { detectDeviceCapabilities, getOptimalModelOptions } from '@/lib/threejs/optimization/deviceCapability';
import { disposeModel } from '@/lib/threejs/utils/modelDisposal';
import { useModelAutoScaling } from '@/lib/threejs/utils/modelScaling';

interface FutureIslandModelProps {
  modelOffset: number;
}

/**
 * Future Island Model Component
 * Displays futuristic island model
 */
export const FutureIslandModel = memo(function FutureIslandModel({ modelOffset }: FutureIslandModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const modelRef = useRef<THREE.Group | null>(null);

  const deviceCapabilities = useMemo(() => detectDeviceCapabilities(), []);
  const modelOptions = useMemo(() => getOptimalModelOptions(deviceCapabilities), [deviceCapabilities]);

  const model = useCachedModel('/assets/models/future-island/scene.gltf', (scene) => {
    return optimizeGLTFScene(scene, modelOptions) as THREE.Group;
  });

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  // Cache WebGL context for safe access
  const webglContextRef = useRef<WebGLRenderingContext | WebGL2RenderingContext | null>(null);

  useEffect(() => {
    try {
      webglContextRef.current = gl.getContext() as WebGLRenderingContext | WebGL2RenderingContext | null;
      if (process.env.NODE_ENV === 'development') {
        console.debug('[FutureIslandModel] WebGL context initialized');
      }
    } catch (error) {
      console.error('[FutureIslandModel] Failed to get WebGL context:', error);
    }

    return () => {
      disposeModel(modelRef.current, webglContextRef.current, 'FutureIslandModel');
      modelRef.current = null;
    };
  }, [gl]);

  // Dynamic bounding box auto-scaling
  const { scale, center } = useModelAutoScaling(model, 2.5);

  useFrame((state) => {
    const webglContext = webglContextRef.current;
    if (groupRef.current && webglContext && typeof webglContext.isContextLost === 'function' && !webglContext.isContextLost()) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.2;
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

FutureIslandModel.displayName = 'FutureIslandModel';
