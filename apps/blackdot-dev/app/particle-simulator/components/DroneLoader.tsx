'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
// @ts-expect-error - Three.js examples typings
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSDF } from '../simulation/windTunnel/MeshSDF';

interface DroneLoaderProps {
  modelPath: string;
  targetSize?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onLoad?: (group: THREE.Group, sdf: (pos: THREE.Vector3) => number) => void;
  onError?: (error: Error) => void;
  useBoundingBoxSDF?: boolean; // Use faster bounding box SDF instead of exact mesh SDF
}

/**
 * DroneLoader - Specialized loader for drone GLB models
 * 
 * Features:
 * - Loads GLB/GLTF models
 * - Auto-scales to target size
 * - Generates SDF for physics calculations
 * - Provides callback with loaded model and SDF function
 */
export function DroneLoader({
  modelPath,
  targetSize = 20,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onLoad,
  onError,
  useBoundingBoxSDF, // No default - must be explicitly passed
}: DroneLoaderProps) {
  // Debug: Log the received value on mount and when it changes
  useEffect(() => {
    console.log('🔍 DroneLoader useBoundingBoxSDF:', {
      value: useBoundingBoxSDF,
      type: typeof useBoundingBoxSDF,
      resolved: useBoundingBoxSDF ?? false,
      willUseExactMesh: !(useBoundingBoxSDF ?? false),
    });
  }, [useBoundingBoxSDF]);
  const groupRef = useRef<THREE.Group>(null);
  const loadedModelRef = useRef<THREE.Group | null>(null);
  const [sdfFunction, setSdfFunction] = useState<((pos: THREE.Vector3) => number) | null>(null);

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

        // Calculate bounding box for auto-scaling
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = targetSize / maxDim;

        console.log(
          `Drone model loaded: ${maxDim.toFixed(2)} → ${targetSize} units ` +
          `(scale: ${scaleFactor.toFixed(3)})`
        );

        // Apply transformations - ensure model is properly centered first
        // Reset any existing transformations
        model.position.set(0, 0, 0);
        model.rotation.set(0, 0, 0);
        model.scale.set(1, 1, 1);
        
        // Center the model at origin (for SDF calculations)
        box.setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        // Now apply user transformations
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        // Apply rotation FIRST, then position (order matters for transformations)
        model.rotation.set(...rotation);
        // Position is applied after centering, so it's relative to the centered model
        model.position.add(new THREE.Vector3(...position));
        
        console.log('DroneLoader: Applied transformations', {
          modelPath,
          targetSize,
          scaleFactor,
          position,
          rotation,
        });

        // Optimize materials
        model.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            if (node.material) {
              const material = node.material as THREE.Material;
              material.opacity = 1.0;
              material.transparent = false;
            }
          }
        });

        // Generate SDF for physics
        // Explicitly check: only use bounding box if explicitly set to true
        // undefined, null, false all mean use exact mesh
        const useBox = useBoundingBoxSDF === true;
        let sdf: (pos: THREE.Vector3) => number;
        
        console.log('🔍 DroneLoader SDF decision:', {
          useBoundingBoxSDF,
          useBox,
          willUseExactMesh: !useBox,
        });
        
        if (useBox) {
          // Faster: use bounding box approximation
          sdf = MeshSDF.createBoundingBoxSDF(model);
          console.log('📦 Using bounding box SDF (fast approximation)');
          console.warn('⚠️ Bounding box SDF does NOT use actual mesh geometry for flow deflection!');
        } else {
          // Slower but more accurate: use exact mesh geometry
          sdf = MeshSDF.createSDFFromMesh(model);
          console.log('✅ Using EXACT mesh SDF (accurate - real geometry)');
          console.log('✅ Flow deflection will use actual mesh surface normals via SDF gradient');
          
          // Verify SDF is using actual mesh by testing at different points
          const testPos1 = new THREE.Vector3(0, 0, 0);
          const testPos2 = new THREE.Vector3(10, 0, 0);
          const testPos3 = new THREE.Vector3(0, 10, 0);
          const dist1 = sdf(testPos1);
          const dist2 = sdf(testPos2);
          const dist3 = sdf(testPos3);
          console.log('🔍 SDF verification (should vary based on mesh shape, not be uniform):', {
            atOrigin: dist1,
            atX10: dist2,
            atY10: dist3,
            note: 'If all values are similar, SDF might be using approximation instead of actual mesh',
          });
        }

        setSdfFunction(() => sdf);

        // Add to scene
        if (groupRef.current) {
          groupRef.current.add(model);
          loadedModelRef.current = model;

          if (onLoad) {
            onLoad(model, sdf);
          }
        }
      },
      (progress: ProgressEvent) => {
        const percentComplete = Math.round((progress.loaded / progress.total) * 100);
        console.log(`Drone loading: ${percentComplete}%`);
      },
      (error: unknown) => {
        console.error('Error loading drone model:', error);
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
    // Remove onLoad and onError from deps - they're callbacks that shouldn't trigger re-loads
    // Use JSON.stringify for arrays to detect actual changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelPath, targetSize, JSON.stringify(position), JSON.stringify(rotation), useBoundingBoxSDF]);

  return <group ref={groupRef} />;
}

/**
 * Available drone models in the assets folder
 */
export const DRONE_MODELS = [
  {
    name: 'Super Cam Reconnaissance',
    path: '/assets/models/super_cam__-_rusian_reconnaissance_drone.glb',
    description: 'Russian reconnaissance drone model',
  },
  {
    name: 'Low Poly Drone',
    path: '/assets/models/dron_low_poly_3d_model_gltf/scene.gltf',
    description: 'Low poly drone model (GLTF)',
  },
  {
    name: 'Desert Camo UAV',
    path: '/assets/models/drone_uav_wing_desert_camo_gltf/scene.gltf',
    description: 'Desert camo UAV with wings (GLTF)',
  },
  {
    name: 'UAV Model',
    path: '/assets/models/uav/Meshy_AI_Make_a_engineering_ap_1230052632_generate.glb',
    description: 'AI-generated engineering UAV model',
  },
] as const;

