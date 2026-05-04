'use client';

import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
// @ts-expect-error - Three.js examples typings
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export interface ModelLoaderProps {
  modelPath: string;
  targetSize?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onLoad?: (group: THREE.Group) => void;
  onError?: (error: Error) => void;
}

/**
 * ModelLoader - Loads and displays 3D models (GLB/GLTF)
 * Handles model loading, scaling, and positioning
 */
export function ModelLoader({
  modelPath,
  targetSize = 35,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onLoad,
  onError,
}: ModelLoaderProps) {
  const groupRef = useRef<THREE.Group>(null);
  const loadedModelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const loader = new GLTFLoader();

    loader.load(
      modelPath,
       
      (gltf: { scene: THREE.Group }) => {
        const model = gltf.scene as THREE.Group;

        // Clear previous model if exists
        if (loadedModelRef.current && groupRef.current) {
          groupRef.current.remove(loadedModelRef.current);
        }

        // ===== AUTO-SCALING =====
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());

        // Find largest dimension
        const maxDim = Math.max(size.x, size.y, size.z);

        // Calculate scale factor for target size
        const scaleFactor = targetSize / maxDim;

        // Log scaling info (helpful for debugging)
        console.log(
          `Model auto-scaled: ${maxDim.toFixed(2)} → ${targetSize} units ` +
          `(scale: ${scaleFactor.toFixed(3)})`
        );
        // ========================

        // Apply transformations with calculated scale
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        model.position.set(...position);
        model.rotation.set(...rotation);

        // Traverse and optimize materials
        model.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            // Enable shadows for better visuals
            node.castShadow = true;
            node.receiveShadow = true;

            // Optimize material
            if (node.material) {
              const material = node.material as THREE.Material;
              // Make material fully opaque for better visibility
              material.opacity = 1.0;
              material.transparent = false;
            }
          }
        });

        // Add to group (managed by React)
        if (groupRef.current) {
          groupRef.current.add(model);
          loadedModelRef.current = model;

          if (onLoad) {
            onLoad(model);
          }
        }
      },
      (progress: ProgressEvent) => {
        // Log loading progress
        const percentComplete = Math.round((progress.loaded / progress.total) * 100);
        console.log(`Model loading: ${percentComplete}%`);
      },
      (error: unknown) => {
        console.error('Error loading model:', error);
        if (onError) {
          onError(error as Error);
        }
      }
    );

    return () => {
      // Cleanup on unmount
      if (loadedModelRef.current && groupRef.current) {
        groupRef.current.remove(loadedModelRef.current);
      }
    };
  }, [modelPath, targetSize, position, rotation, onLoad, onError]);

  return <group ref={groupRef} />;
}
