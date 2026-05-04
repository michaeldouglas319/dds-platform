'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCachedModel } from '@/lib/threejs/utils/modelCache';
import { optimizeGLTFScene } from '@/lib/threejs/optimization/modelOptimization';
import { detectDeviceCapabilities, getOptimalModelOptions } from '@/lib/threejs/optimization/deviceCapability';

interface FallbackModelProps {
  color?: string;
}

/**
 * FallbackModel Component
 * Shows a simple geometric shape as fallback when section doesn't have modelConfig
 * Uses a book model as a generic placeholder
 */
export function FallbackModel({ color = '#4CAF50' }: FallbackModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const modelRef = useRef<THREE.Group | null>(null);

  // Device capabilities for optimization
  const deviceCapabilities = useMemo(() => detectDeviceCapabilities(), []);
  const modelOptions = useMemo(
    () => getOptimalModelOptions(deviceCapabilities),
    [deviceCapabilities]
  );

  // Load the 3d-drawing model as fallback
  const model = useCachedModel('/assets/models/text/md/3d-drawing.gltf', (scene) => {
    return optimizeGLTFScene(scene, modelOptions) as THREE.Group;
  });

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (!modelRef.current) return;

      try {
        const webglContext = gl.getContext() as
          | WebGLRenderingContext
          | WebGL2RenderingContext
          | null;
        if (webglContext && !webglContext.isContextLost()) {
          modelRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (child.geometry) child.geometry.dispose();
              if (child.material) {
                const materials = Array.isArray(child.material)
                  ? child.material
                  : [child.material];
                materials.forEach((mat) => {
                  Object.keys(mat).forEach((key) => {
                    const value = (mat as Record<string, unknown>)[key];
                    if (value && value instanceof THREE.Texture) {
                      value.dispose();
                    }
                  });
                  mat.dispose();
                });
              }
            }
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('FallbackModel disposal error:', error);
        }
      }
      modelRef.current = null;
    };
  }, [gl]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const webglContext = gl.getContext() as
      | WebGLRenderingContext
      | WebGL2RenderingContext
      | null;
    if (webglContext && webglContext.isContextLost()) return;

    groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
  });

  return (
    <group ref={groupRef} scale={.01} position={[0, 0, 0]}>
      <primitive object={model} />
    </group>
  );
}
