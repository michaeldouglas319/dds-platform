'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-expect-error - Three.js examples typings
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// @ts-expect-error - Three.js examples typings
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

interface ModelLoaderProps {
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

    // Configure GLTFLoader with Draco decoder for mesh compression
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    
    // Use Google's CDN for Draco decoder (official builds from gstatic.com)
    // Alternative: Use local decoder from node_modules/draco3d/gltf/
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    
    // Enable Draco compression support
    loader.setDRACOLoader(dracoLoader);

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

    // Capture current ref values for cleanup
    const currentLoadedModel = loadedModelRef.current;
    const currentGroup = groupRef.current;

    return () => {
      // Cleanup on unmount
      if (currentLoadedModel && currentGroup) {
        currentGroup.remove(currentLoadedModel);
      }
      // Cleanup Draco loader
      dracoLoader.dispose();
    };
  }, [modelPath, targetSize, position, rotation, onLoad, onError]);

  return <group ref={groupRef} />;
}
