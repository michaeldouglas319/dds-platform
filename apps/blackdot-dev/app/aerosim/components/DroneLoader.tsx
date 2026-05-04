'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-expect-error - Three.js examples typings
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// @ts-expect-error - Three.js examples typings
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { MeshSDF } from '../simulation/windTunnel/MeshSDF';
import { MeshSDF_BVH } from '../simulation/windTunnel/MeshSDF_BVH';
import { SDFVoxelGrid } from '../simulation/windTunnel/SDFVoxelGrid';

type SDFWithExtensions = ((pos: THREE.Vector3) => number) & {
  __meshSDFInstance?: MeshSDF_BVH;
  __voxelGrid?: SDFVoxelGrid;
};

interface DroneLoaderProps {
  modelPath: string;
  targetSize?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onLoad?: (group: THREE.Group, sdf: (pos: THREE.Vector3) => number, voxelGrid?: SDFVoxelGrid) => void;
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
  const [_sdfFunction, setSdfFunction] = useState<((pos: THREE.Vector3) => number) | null>(null);

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
        
        // CRITICAL: Update matrix world BEFORE creating SDF
        // This ensures the transformation matrix is correct for coordinate space conversion
        // Force world matrix update before SDF creation (proven via updateMatrixWorld in Three.js core)
        model.updateMatrixWorld(true);
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.updateMatrixWorld(true);
          }
        });
        
        console.log('DroneLoader: Applied transformations', {
          modelPath,
          targetSize,
          scaleFactor,
          position,
          rotation,
          matrixWorld: {
            position: { x: model.position.x, y: model.position.y, z: model.position.z },
            scale: { x: model.scale.x, y: model.scale.y, z: model.scale.z },
          },
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
          // Use BVH-accelerated SDF for optimal performance
          // Model is centered at origin, so SDF is created in world space
          // MeshSDF_BVH uses matrixWorld when extracting triangles, so SDF is already correct
          const { sdf: sdfFunc, instance: sdfInstance } = MeshSDF_BVH.createSDFFromMesh(model);
          
          // Use SDF directly - model is centered at origin, so no transformation needed
          sdf = sdfFunc;
          
          // Store instance reference for stats access
          (sdf as SDFWithExtensions).__meshSDFInstance = sdfInstance;
          
          // Phase 2: Create voxel grid for spatial caching
          const meshBounds = new THREE.Box3().setFromObject(model);
          const voxelGrid = new SDFVoxelGrid(sdf, sdfInstance, meshBounds, 0.5);
          
          // Precompute voxel grid around mesh (Phase 2.1)
          console.log('🔄 Phase 2: Precomputing voxel grid...');
          voxelGrid.precomputeRegion(10.0, 100000); // 10 unit expansion, max 100k voxels
          
          // Store voxel grid reference in SDF function
          (sdf as SDFWithExtensions).__voxelGrid = voxelGrid;
          
          console.log('🔧 SDF Coordinate Space (Simplified):', {
            modelPosition: { x: model.position.x.toFixed(2), y: model.position.y.toFixed(2), z: model.position.z.toFixed(2) },
            modelScale: { x: model.scale.x.toFixed(2), y: model.scale.y.toFixed(2), z: model.scale.z.toFixed(2) },
            note: 'Model centered at origin - SDF in world space, using directly without transformation',
          });
          
          console.log('✅ Using BVH-accelerated mesh SDF (O(log n) queries + LRU cache)');
          console.log('✅ Flow deflection will use actual mesh surface normals via SDF gradient');
          console.log('✅ Curvature-aware flow modulation enabled');
          
          // Get and log performance stats
          const stats = sdfInstance.getStats();
          console.log('📊 BVH Performance Stats:', {
            buildTime: `${stats.buildTime.toFixed(2)}ms`,
            triangles: stats.triangleCount,
            cacheHitRate: `${(stats.cacheHitRate * 100).toFixed(1)}%`,
          });
          
          // Verify SDF is using actual mesh by testing at different points
          // Test at multiple points to verify variance (not uniform sphere/box)
          const testPositions = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(10, 0, 0),
            new THREE.Vector3(0, 10, 0),
            new THREE.Vector3(0, 0, 10),
            new THREE.Vector3(5, 5, 5),
            new THREE.Vector3(-5, -5, -5),
          ];
          const sdfValues = testPositions.map(p => sdf(p));
          const sdfVariance = Math.max(...sdfValues) - Math.min(...sdfValues);
          const sdfStdDev = Math.sqrt(
            sdfValues.reduce((sum, val) => {
              const mean = sdfValues.reduce((a, b) => a + b) / sdfValues.length;
              return sum + Math.pow(val - mean, 2);
            }, 0) / sdfValues.length
          );
          
          console.log('🔍 SDF verification (should vary based on mesh shape, not be uniform):', {
            testPositions: testPositions.map(p => ({ x: p.x, y: p.y, z: p.z })),
            sdfValues: sdfValues.map(v => v.toFixed(2)),
            variance: sdfVariance.toFixed(2),
            stdDev: sdfStdDev.toFixed(2),
            diagnosis: sdfVariance < 2.0 
              ? '⚠️⚠️⚠️ PROBLEM: Low variance - SDF may be using sphere/box approximation!'
              : sdfVariance < 5.0
              ? '⚠️ WARNING: Moderate variance - may need investigation'
              : '✅ GOOD: High variance - SDF is using actual mesh geometry',
            note: 'If all values are similar, SDF might be using approximation instead of actual mesh',
          });
        }

        setSdfFunction(() => sdf);

        // Add to scene
        if (groupRef.current) {
          groupRef.current.add(model);
          loadedModelRef.current = model;

          if (onLoad) {
            // Phase 2: Pass voxel grid to onLoad
            const voxelGrid = (sdf as SDFWithExtensions).__voxelGrid;
            onLoad(model, sdf, voxelGrid);
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
      // Cleanup on unmount - capture refs at cleanup time
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const currentGroup = groupRef.current;
      const currentModel = loadedModelRef.current;
      if (currentModel && currentGroup) {
        currentGroup.remove(currentModel);
      }
      // Cleanup Draco loader
      dracoLoader.dispose();
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

