'use client';

/**
 * Model Viewer for Slide
 * Efficiently loads and renders 3D models from GLTF/GLB files
 * Caches models and handles errors gracefully
 */

import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ModelViewerForSlideProps {
  modelPath: string;
}

export default function ModelViewerForSlide({ modelPath }: ModelViewerForSlideProps) {
  const groupRef = useRef<THREE.Group>(null);

  try {
    // Load model with caching via useGLTF
    const { scene } = useGLTF(modelPath);

    // Clone scene to avoid mutation issues
    const clonedScene = scene.clone();

    // Optimize materials for performance
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Enable casting/receiving shadows
        child.castShadow = true;
        child.receiveShadow = true;

        // Optimize geometry
        if (child.geometry) {
          child.geometry.computeBoundingBox();
        }

        // Improve material rendering
        if (child.material instanceof THREE.Material) {
          child.material.side = THREE.DoubleSide;
        }
      }
    });

    return (
      <group ref={groupRef}>
        <primitive object={clonedScene} />
      </group>
    );
  } catch (error) {
    // Graceful fallback if model fails to load
    console.warn(`Failed to load model: ${modelPath}`, error);

    // Render a simple fallback geometry
    return (
      <group ref={groupRef}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial
            color="#6366f1"
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
      </group>
    );
  }
}
