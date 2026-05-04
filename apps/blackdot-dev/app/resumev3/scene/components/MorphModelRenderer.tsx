"use client"

/**
 * Morph-Enhanced Model Renderer
 *
 * Wraps ModelRenderer with optional morph animation support.
 * Implements clear fallback strategy - if morph generation fails,
 * falls back to standard ModelRenderer without breaking.
 *
 * Features:
 * - Opt-in morph support via `enableMorph` prop
 * - Automatic fallback on morph generation errors
 * - Hover and active state morph animations
 * - Compatible with all existing ModelRenderer props
 */

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import {
  MorphModel,
  generateSpherifyMorph,
  generateInflateMorph,
  type MorphControls,
  type MorphTarget
} from '@/lib/threejs/morph';
import { ModelRenderer, type ModelType } from './ModelRenderer';

interface MorphModelRendererProps {
  modelType: ModelType;
  textureUrl?: string;
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  modelOffset?: number;

  // Morph-specific props
  enableMorph?: boolean;
  isHovered?: boolean;
  isActive?: boolean;
  morphIntensity?: number;
}

/**
 * Strategy Pattern: Morph Generation with Fallback
 */
class MorphFallbackStrategy {
  private static generationCache = new Map<string, MorphTarget[] | null>();

  /**
   * Attempt to generate morph targets with graceful fallback
   * Returns null if generation fails (signals fallback to non-morph)
   */
  static generateMorphTargets(
    geometry: THREE.BufferGeometry | undefined,
    modelType: ModelType,
    intensity: number = 0.5
  ): MorphTarget[] | null {
    // Check cache first
    const cacheKey = `${modelType}-${intensity}`;
    if (this.generationCache.has(cacheKey)) {
      return this.generationCache.get(cacheKey)!;
    }

    if (!geometry || !geometry.attributes.position) {
      console.warn(`[MorphFallback] No valid geometry for ${modelType}, using standard renderer`);
      this.generationCache.set(cacheKey, null);
      return null;
    }

    try {
      const targets = [
        generateSpherifyMorph(geometry, { intensity: intensity * 0.5 } as any),
        generateInflateMorph(geometry, { intensity: intensity * 0.3 } as any),
      ];

      console.log(`[MorphFallback] Successfully generated morph targets for ${modelType}`);
      this.generationCache.set(cacheKey, targets);
      return targets;
    } catch (error) {
      console.warn(`[MorphFallback] Failed to generate morph for ${modelType}:`, error);
      console.warn(`[MorphFallback] Falling back to standard rendering`);
      this.generationCache.set(cacheKey, null);
      return null;
    }
  }

  static clearCache() {
    this.generationCache.clear();
  }
}

/**
 * Morph-Enhanced GLB Model (Tesla)
 */
function MorphGLBModel({
  path,
  scale,
  position,
  rotation,
  isHovered,
  isActive,
  intensity = 0.5
}: {
  path: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  isHovered?: boolean;
  isActive?: boolean;
  intensity?: number;
}) {
  const { scene } = useGLTF(path);
  const morphRef = useRef<MorphControls>(null);
  const [morphTargets, setMorphTargets] = useState<MorphTarget[] | null>(null);
  const [hasMorphError, setHasMorphError] = useState(false);

  // Generate morph targets with fallback
  useEffect(() => {
    try {
      const clonedScene = scene.clone();
      let foundGeometry: THREE.BufferGeometry | undefined;

      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry && !foundGeometry) {
          const geometry = child.geometry as THREE.BufferGeometry;
          // Clone geometry to avoid mutating original
          foundGeometry = geometry.clone();
        }
      });

      const targets = MorphFallbackStrategy.generateMorphTargets(
        foundGeometry,
        'tesla',
        intensity
      );

      if (!targets || targets.length === 0) {
        setHasMorphError(true);
      } else {
        setMorphTargets(targets);
      }
    } catch (error) {
      console.warn('[MorphGLBModel] Error during setup:', error);
      setHasMorphError(true);
    }
  }, [scene, intensity]);

  // Animate morph based on state
  useEffect(() => {
    if (!morphRef.current || !morphTargets) return;

    if (isActive) {
      morphRef.current.setInfluence(1, 0.6, true); // Inflate
    } else if (isHovered) {
      morphRef.current.setInfluence(0, 0.3, true); // Spherify
    } else {
      morphRef.current.reset(true);
    }
  }, [isActive, isHovered, morphTargets]);

  const { scaledScene, centerOffset } = useMemo(() => {
    const clonedScene = scene.clone();
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetScale = ((scale || 2.5) * 1.5) / maxDim;

    return {
      scaledScene: clonedScene,
      centerOffset: center.multiplyScalar(-targetScale),
    };
  }, [scene, scale]);

  // Fallback: No morph targets or error
  if (hasMorphError || !morphTargets || morphTargets.length === 0) {
    return (
      <group position={position} rotation={rotation}>
        <primitive
          object={scaledScene}
          scale={scale || 2.5}
          position={[centerOffset.x, centerOffset.y, centerOffset.z]}
        />
      </group>
    );
  }

  // Success: Render with morph (wrapped in try-catch for runtime safety)
  try {
    return (
      <group position={position} rotation={rotation}>
        <MorphModel
          morphTargets={morphTargets}
          initialInfluences={[0, 0]}
          ref={morphRef}
        >
          <primitive
            object={scaledScene}
            scale={scale || 2.5}
            position={[centerOffset.x, centerOffset.y, centerOffset.z]}
          />
        </MorphModel>
      </group>
    );
  } catch (error) {
    console.warn('[MorphGLBModel] Runtime error, using fallback:', error);
    return (
      <group position={position} rotation={rotation}>
        <primitive
          object={scaledScene}
          scale={scale || 2.5}
          position={[centerOffset.x, centerOffset.y, centerOffset.z]}
        />
      </group>
    );
  }
}

/**
 * Morph-Enhanced Geometry Models
 */
function MorphGeometryModel({
  modelType,
  color,
  scale,
  position,
  rotation,
  isHovered,
  isActive,
  intensity = 0.5
}: {
  modelType: ModelType;
  color?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  isHovered?: boolean;
  isActive?: boolean;
  intensity?: number;
}) {
  const morphRef = useRef<MorphControls>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const [morphTargets, setMorphTargets] = useState<MorphTarget[] | null>(null);
  const [hasMorphError, setHasMorphError] = useState(false);

  // Generate morph targets when geometry is available
  useEffect(() => {
    if (!geometryRef.current) return;

    try {
      // Clone geometry to avoid mutations
      const clonedGeometry = geometryRef.current.clone();
      const targets = MorphFallbackStrategy.generateMorphTargets(
        clonedGeometry,
        modelType,
        intensity
      );

      if (!targets || targets.length === 0) {
        setHasMorphError(true);
      } else {
        setMorphTargets(targets);
      }
    } catch (error) {
      console.warn('[MorphGeometryModel] Error during setup:', error);
      setHasMorphError(true);
    }
  }, [geometryRef.current, modelType, intensity]);

  // Animate morph based on state
  useEffect(() => {
    if (!morphRef.current || !morphTargets) return;

    if (isActive) {
      morphRef.current.setInfluence(1, 0.6, true);
    } else if (isHovered) {
      morphRef.current.setInfluence(0, 0.3, true);
    } else {
      morphRef.current.reset(true);
    }
  }, [isActive, isHovered, morphTargets]);

  const materialColor = new THREE.Color(color || '#4CAF50');

  // Get geometry args based on model type
  const getGeometryArgs = (): [number, number, number] => {
    switch (modelType) {
      case 'building': return [2, 2, 2];
      case 'uav-drone': return [1.5, 0.5, 1.5];
      case 'book': return [1, 1.5, 0.3];
      default: return [1, 1, 1];
    }
  };

  const GeometryMesh = () => (
    <mesh scale={scale || 1.5}>
      <boxGeometry ref={geometryRef as any} args={getGeometryArgs()} />
      <meshStandardMaterial
        color={materialColor}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );

  // Fallback: No morph targets or error
  if (hasMorphError || !morphTargets || morphTargets.length === 0) {
    return (
      <group position={position} rotation={rotation}>
        <GeometryMesh />
      </group>
    );
  }

  // Success: Render with morph (with runtime safety)
  try {
    return (
      <group position={position} rotation={rotation}>
        <MorphModel
          morphTargets={morphTargets}
          initialInfluences={[0, 0]}
          ref={morphRef}
        >
          <GeometryMesh />
        </MorphModel>
      </group>
    );
  } catch (error) {
    console.warn('[MorphGeometryModel] Runtime error, using fallback:', error);
    return (
      <group position={position} rotation={rotation}>
        <GeometryMesh />
      </group>
    );
  }
}

/**
 * Main Morph Model Renderer
 *
 * Fallback Strategy:
 * 1. If enableMorph=false, use standard ModelRenderer
 * 2. If enableMorph=true but morph generation fails, fall back to ModelRenderer
 * 3. Only use morph if successfully generated
 */
export function MorphModelRenderer(props: MorphModelRendererProps) {
  const {
    modelType,
    enableMorph = false,
    isHovered = false,
    isActive = false,
    morphIntensity = 0.5,
    ...modelProps
  } = props;

  // Early return: Morph disabled, use standard renderer
  if (!enableMorph) {
    return <ModelRenderer modelType={modelType} {...modelProps} />;
  }

  // Morph support for GLB models (Tesla)
  if (modelType === 'tesla') {
    return (
      <MorphGLBModel
        path="/assets/tesla_logo.glb"
        scale={modelProps.scale}
        position={modelProps.position}
        rotation={modelProps.rotation}
        isHovered={isHovered}
        isActive={isActive}
        intensity={morphIntensity}
      />
    );
  }

  // Morph support for geometry models
  if (['building', 'uav-drone', 'book'].includes(modelType)) {
    return (
      <MorphGeometryModel
        modelType={modelType}
        color={modelProps.color}
        scale={modelProps.scale}
        position={modelProps.position}
        rotation={modelProps.rotation}
        isHovered={isHovered}
        isActive={isActive}
        intensity={morphIntensity}
      />
    );
  }

  // Fallback: Model types that don't support morph (textures, neural network)
  console.log(`[MorphFallback] Model type ${modelType} doesn't support morph, using standard renderer`);
  return <ModelRenderer modelType={modelType} {...modelProps} />;
}

// Export utility for clearing cache (useful for development)
export const clearMorphCache = () => MorphFallbackStrategy.clearCache();
