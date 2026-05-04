"use client"

import React, { useMemo, Suspense, useRef, useEffect } from 'react';
import { useGLTF, Image } from '@react-three/drei';
import * as THREE from 'three';
import { NeuralNetwork } from '@/app/landing/node/NeuralNetwork';
import { MorphModel, generateSpherifyMorph, generateInflateMorph, type MorphControls } from '@/lib/threejs/morph';
import type { MapJobPosition } from '../config/map.config';
import { getResumeModelConfig } from '@/lib/config/models/resumeModels.config';

interface JobModelProps {
  jobPosition: MapJobPosition;
  isActive?: boolean;
  isHovered?: boolean;
}

/**
 * Job Model Component
 *
 * Renders the appropriate 3D model for a job position.
 * Handles different model types with graceful fallbacks.
 *
 * Model Types:
 * - GLB models (e.g., Tesla logo)
 * - Texture-based models (e.g., company logos)
 * - Component-based models (e.g., Neural Network)
 * - Fallback geometry for missing models
 */
export function JobModel({ jobPosition, isActive = false, isHovered = false }: JobModelProps) {
  const { modelType, position, rotation, scale = 1 } = jobPosition;
  const morphRef = useRef<MorphControls>(null);

  // Trigger morph animations when active or hovered
  useEffect(() => {
    if (!morphRef.current) return;

    if (isActive) {
      // Inflate effect when active
      morphRef.current.setInfluence(1, 0.6, true);
    } else if (isHovered) {
      // Slight spherify effect on hover
      morphRef.current.setInfluence(0, 0.3, true);
    } else {
      // Reset to normal
      morphRef.current.reset(true);
    }
  }, [isActive, isHovered]);

  // Gracefully handle missing model type
  if (!modelType) {
    return (
      <FallbackModel
        position={position}
        rotation={rotation}
        scale={scale}
      />
    );
  }

  // Get model config with error handling
  let modelConfig;
  try {
    modelConfig = getResumeModelConfig(modelType);
  } catch (error) {
    console.warn(`Model config not found for type: ${modelType}`, error);
    return (
      <FallbackModel
        position={position}
        rotation={rotation}
        scale={scale}
      />
    );
  }

  return (
    <group position={position} rotation={rotation}>
      <Suspense fallback={<FallbackModel scale={scale} />}>
        {/* GLB Models */}
        {modelConfig.format === 'glb' && (
          <GLBModel
            path={jobPosition.modelPath || modelConfig.path}
            scale={scale}
          />
        )}

        {/* Texture-based models */}
        {modelConfig.format === 'texture' && (
          <TextureModel
            textureUrl={jobPosition.textureUrl || modelConfig.path}
            scale={scale}
          />
        )}

        {/* Component-based models */}
        {modelConfig.format === 'component' && modelType === 'neural-network' && (
          <NeuralNetwork position={[0, 0, 0]} scale={scale * 0.5} />
        )}

        {/* Geometry-based models (fallback shapes) */}
        {modelConfig.format === 'geometry' && (
          <GeometryModel modelType={modelType} scale={scale} />
        )}
      </Suspense>
    </group>
  );
}

/**
 * GLB Model Loader with Morph Support
 */
function GLBModel({ path, scale }: { path: string; scale: number }) {
  const { scene } = useGLTF(path);
  const morphRef = useRef<MorphControls>(null);

  const { scaledScene, centerOffset, morphTargets } = useMemo(() => {
    const clonedScene = scene.clone();

    // Calculate bounding box for centering and scaling
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetScale = (scale * 1.5) / maxDim;

    // Generate morph targets for the mesh
    let targets: any[] = [];
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        try {
          targets = [
            generateSpherifyMorph(child.geometry as THREE.BufferGeometry, 'spherify', 0.3),
            generateInflateMorph(child.geometry as THREE.BufferGeometry, 'inflate', 0.2),
          ];
        } catch (error) {
          console.warn('Failed to generate morph targets:', error);
        }
      }
    });

    return {
      scaledScene: clonedScene,
      centerOffset: center.multiplyScalar(-targetScale),
      morphTargets: targets,
    };
  }, [scene, scale]);

  // If we have morph targets, wrap in MorphModel
  if (morphTargets.length > 0) {
    return (
      <MorphModel
        morphTargets={morphTargets}
        initialInfluences={[0, 0]}
        ref={morphRef}
      >
        <primitive
          object={scaledScene}
          scale={scale}
          position={[centerOffset.x, centerOffset.y, centerOffset.z]}
        />
      </MorphModel>
    );
  }

  return (
    <primitive
      object={scaledScene}
      scale={scale}
      position={[centerOffset.x, centerOffset.y, centerOffset.z]}
    />
  );
}

/**
 * Texture-based Model (company logos)
 */
function TextureModel({ textureUrl, scale }: { textureUrl: string; scale: number }) {
  return (
    <Image
      url={textureUrl}
      transparent
      scale={scale * 1.2}
    />
  );
}

/**
 * Geometry-based Model (simple shapes) with Morph
 */
function GeometryModel({ modelType, scale }: { modelType: string; scale: number }) {
  const morphRef = useRef<MorphControls>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  const morphTargets = useMemo(() => {
    if (!geometryRef.current) return [];

    try {
      return [
        generateSpherifyMorph(geometryRef.current, 'spherify', 0.5),
        generateInflateMorph(geometryRef.current, 'inflate', 0.3),
      ];
    } catch (error) {
      console.warn('Failed to generate morph targets for geometry:', error);
      return [];
    }
  }, [geometryRef.current]);

  const GeometryMesh = () => {
    switch (modelType) {
      case 'building':
        return (
          <mesh scale={scale}>
            <boxGeometry ref={geometryRef as any} args={[2, 2, 2]} />
            <meshStandardMaterial color="#6366f1" />
          </mesh>
        );
      case 'uav-drone':
        return (
          <mesh scale={scale}>
            <boxGeometry ref={geometryRef as any} args={[1.5, 0.5, 1.5]} />
            <meshStandardMaterial color="#10b981" />
          </mesh>
        );
      case 'book':
        return (
          <mesh scale={scale}>
            <boxGeometry ref={geometryRef as any} args={[1, 1.5, 0.3]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        );
      default:
        return <FallbackModel scale={scale} />;
    }
  };

  if (morphTargets.length > 0) {
    return (
      <MorphModel
        morphTargets={morphTargets}
        initialInfluences={[0, 0]}
        ref={morphRef}
      >
        <GeometryMesh />
      </MorphModel>
    );
  }

  return <GeometryMesh />;
}

/**
 * Fallback Model (when model type is unknown or missing)
 */
function FallbackModel({
  position,
  rotation,
  scale = 1,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#6b7280"
        wireframe
        opacity={0.5}
        transparent
      />
    </mesh>
  );
}
