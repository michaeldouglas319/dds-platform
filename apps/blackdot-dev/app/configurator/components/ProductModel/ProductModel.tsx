'use client';

import { useEffect, useRef, useMemo, memo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCachedModel } from '@/lib/threejs/utils/modelCache';
import { useModelAutoScaling } from '@/lib/threejs/utils/modelScaling';
import { disposeModel } from '@/lib/threejs/utils/modelDisposal';
import { optimizeGLTFScene } from '@/lib/threejs/optimization/modelOptimization';
import {
  detectDeviceCapabilities,
  getOptimalModelOptions,
} from '@/lib/threejs/optimization/deviceCapability';
import type { ProductDefinition, ProductConfiguration } from '../../types';

interface ProductModelProps {
  product: ProductDefinition;
  configuration: ProductConfiguration;
  modelOffset?: number;
  enableRotation?: boolean;
}

/**
 * ProductModel component for rendering and customizing 3D products
 *
 * Handles:
 * - Dynamic model loading with caching
 * - Auto-scaling and positioning
 * - Material customization (color, metalness, roughness)
 * - Part visibility toggling
 * - Device-optimized rendering
 * - Proper cleanup and disposal
 */
export const ProductModel = memo(function ProductModel({
  product,
  configuration,
  modelOffset = 0,
  enableRotation = false,
}: ProductModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const { gl } = useThree();

  // Detect device capabilities and get optimal model options
  const deviceCapabilities = useMemo(() => detectDeviceCapabilities(), []);
  const modelOptions = useMemo(
    () => getOptimalModelOptions(deviceCapabilities),
    [deviceCapabilities]
  );

  // Load model with caching and optimization
  const model = useCachedModel(product.modelPath, (scene) => {
    return optimizeGLTFScene(scene, modelOptions) as THREE.Group;
  });

  // Auto-scale model based on bounding box
  const { scale, center } = useModelAutoScaling(model, product.defaultScale || 2.5);

  // Apply materials and visibility based on configuration
  useEffect(() => {
    if (!model) return;

    modelRef.current = model;

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const meshName = child.name;

        // Find which part this mesh belongs to
        const part = product.parts.find((p) =>
          p.meshNames.some((name) => meshName.toLowerCase().includes(name.toLowerCase()))
        );

        if (part) {
          // Apply visibility from configuration
          child.visible = configuration.visibility[part.name] ?? part.visible;

          // Get material config for this part
          const materialConfig = configuration.materials[part.name] || product.materials[part.name];

          if (materialConfig && child.material) {
            const color = new THREE.Color(materialConfig.defaultColor);

            // Update existing material or create new one
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.color = color;
              child.material.metalness = materialConfig.metalness;
              child.material.roughness = materialConfig.roughness;

              if (materialConfig.emissive) {
                child.material.emissive = new THREE.Color(materialConfig.emissive);
                child.material.emissiveIntensity = materialConfig.emissiveIntensity || 0;
              }

              child.material.needsUpdate = true;
            } else {
              // Create new material if not standard
              const newMaterial = new THREE.MeshStandardMaterial({
                color,
                metalness: materialConfig.metalness,
                roughness: materialConfig.roughness,
              });

              if (materialConfig.emissive) {
                newMaterial.emissive = new THREE.Color(materialConfig.emissive);
                newMaterial.emissiveIntensity = materialConfig.emissiveIntensity || 0;
              }

              child.material = newMaterial;
            }
          }
        }
      }
    });
  }, [model, configuration, product.id]);

  // Optional rotation animation
  useFrame((state) => {
    if (!groupRef.current || !enableRotation) return;

    const webglContext = gl.getContext() as
      | WebGLRenderingContext
      | WebGL2RenderingContext
      | null;
    if (webglContext && !webglContext.isContextLost()) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Note: disposeModel expects WebGL context but we're passing renderer
      disposeModel(modelRef.current, gl as any, `ProductModel-${product.id}`);
      modelRef.current = null;
    };
  }, [gl, product.id]);

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
