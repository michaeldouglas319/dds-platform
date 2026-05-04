'use client';

import { useRef, useMemo, useEffect, memo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import * as THREE from 'three';
import { useCachedModel } from '@/lib/threejs/utils/modelCache';
import { optimizeGLTFScene } from '@/lib/threejs/optimization/modelOptimization';
import { detectDeviceCapabilities, getOptimalModelOptions } from '@/lib/threejs/optimization/deviceCapability';
import type { ModelConfig } from '@/lib/config/content';

interface DynamicModelProps {
  modelConfig: ModelConfig;
  modelOffset?: number;
}

/**
 * DynamicModel Component
 * Loads and displays any 3D model based on configuration
 * Supports animations (rotate, float, pulse) and device-based optimization
 *
 * Pattern: Memoized to prevent unnecessary re-renders
 * Uses proper cleanup to prevent memory leaks
 */
export const DynamicModel = memo(function DynamicModel({
  modelConfig,
  modelOffset = 0,
}: DynamicModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const modelRef = useRef<THREE.Group | null>(null);

  // Device capabilities for optimization - memoized
  const deviceCapabilities = useMemo(() => detectDeviceCapabilities(), []);
  const modelOptions = useMemo(
    () => getOptimalModelOptions(deviceCapabilities),
    [deviceCapabilities]
  );

  // Return null if no model path is provided
  if (!modelConfig.path) {
    return null;
  }

  // Load and cache the model
  const model = useCachedModel(modelConfig.path, (scene) => {
    return optimizeGLTFScene(scene, modelOptions) as THREE.Group;
  });

  // Store model reference
  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  // Proper cleanup on unmount
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
              // Dispose geometry
              if (child.geometry) {
                child.geometry.dispose();
              }
              // Dispose materials and textures
              if (child.material) {
                const materials = Array.isArray(child.material)
                  ? child.material
                  : [child.material];
                materials.forEach((mat) => {
                  // Dispose all textures
                  Object.keys(mat).forEach((key) => {
                    const value = (mat as Record<string, unknown>)[key];
                    if (value && value instanceof THREE.Texture) {
                      value.dispose();
                    }
                  });
                  // Dispose material
                  mat.dispose();
                });
              }
            }
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('DynamicModel disposal error:', error);
        }
      }
      modelRef.current = null;
    };
  }, [gl]);

  // Handle animations based on config
  useFrame((state) => {
    if (!groupRef.current) return;

    const animation = modelConfig.animation || {
      type: 'rotate',
      speed: 0.3,
    };

    const webglContext = gl.getContext() as
      | WebGLRenderingContext
      | WebGL2RenderingContext
      | null;
    if (webglContext && webglContext.isContextLost()) return;

    switch (animation.type) {
      case 'rotate':
        groupRef.current.rotation.y =
          Math.sin(state.clock.elapsedTime * (animation.speed || 0.3)) * 0.1;
        break;

      case 'float':
        groupRef.current.position.y =
          Math.sin(state.clock.elapsedTime * (animation.speed || 0.5)) *
          (animation.amplitude || 0.1);
        break;

      case 'pulse': {
        const baseScale = modelConfig.scale || 1;
        const scaleVariation =
          Math.sin(state.clock.elapsedTime * (animation.speed || 1)) *
          (animation.amplitude || 0.05);
        groupRef.current.scale.setScalar(baseScale + scaleVariation);
        break;
      }

      case 'none':
      default:
        // No animation
        break;
    }
  });

  return (
    <Center position={[modelOffset, 0, 0]}>
      <group
        ref={groupRef}
        scale={modelConfig.scale || 1}
        position={modelConfig.position || [0, 0, 0]}
        rotation={modelConfig.rotation || [0, 0, 0]}
      >
        <primitive object={model} />
      </group>
    </Center>
  );
});

DynamicModel.displayName = 'DynamicModel';
