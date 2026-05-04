'use client';

import React, { useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import dynamic from 'next/dynamic';
import { getModelConfig, ModelConfig } from '../config/model-config-loader';
import { SDFVoxelGrid } from '../simulation/windTunnel/SDFVoxelGrid';

// Dynamically import ModelLoader to avoid SSR issues
const ModelLoader = dynamic(() => import('./ModelLoader').then(mod => ({ default: mod.ModelLoader })), {
  ssr: false,
  loading: () => <mesh><sphereGeometry args={[5, 16, 16]} /><meshPhongMaterial color={0x666666} /></mesh>,
});

// Dynamically import DroneLoader
const DroneLoader = dynamic(() => import('./DroneLoader').then(mod => ({ default: mod.DroneLoader })), {
  ssr: false,
  loading: () => <mesh><sphereGeometry args={[5, 16, 16]} /><meshPhongMaterial color={0x666666} /></mesh>,
});

interface ObstacleVisualizerProps {
  obstacleType?: string;
  modelPath?: string; // Optional: allow external model path selection
  useBoundingBoxSDF?: boolean; // Optional: allow SDF mode selection
  onSDFLoaded?: (sdf: (pos: THREE.Vector3) => number, bounds: THREE.Box3) => void; // NEW: Pass SDF to parent
  onBoundsLoaded?: (bounds: THREE.Box3) => void; // NEW: Pass bounds for non-mesh obstacles (cylinder, sphere, etc.)
  onConfigLoaded?: (config: { dynamic_source_area?: boolean }) => void; // NEW: Pass config to parent
}

/**
 * ObstacleVisualizer - Renders 3D obstacle shapes in the wind tunnel
 * For 'plane' obstacle, loads actual 3D model from GLB
 * For other obstacles, renders procedural geometry
 */
export function ObstacleVisualizer({
  obstacleType = 'none',
  modelPath,
  useBoundingBoxSDF, // No default - must be passed from parent
  onSDFLoaded,
  onBoundsLoaded,
  onConfigLoaded,
}: ObstacleVisualizerProps) {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [_loadedSDF, setLoadedSDF] = useState<((pos: THREE.Vector3) => number) | null>(null);
  const [droneConfig, setDroneConfig] = useState<ModelConfig | null>(null);
  const [planeConfig, setPlaneConfig] = useState<ModelConfig | null>(null);

  // Default model paths if not provided
  const defaultDronePath = '/assets/models/super_cam__-_rusian_reconnaissance_drone.glb';
  const defaultPlanePath = '/assets/models/2_plane.glb';
  
  const selectedDronePath = modelPath || defaultDronePath;
  const selectedPlanePath = modelPath || defaultPlanePath;

  // Load model configurations from JSON
  useEffect(() => {
    console.log('🔄 Loading config for drone path:', selectedDronePath);
    getModelConfig(selectedDronePath, true).then((config) => {
      console.log('✅ Drone config loaded:', selectedDronePath, config);
      setDroneConfig(config);
      
      // Pass config to parent for dynamic_source_area
      if (onConfigLoaded) {
        onConfigLoaded({ dynamic_source_area: config.dynamic_source_area });
      }
    }).catch((error) => {
      console.error('❌ Failed to load drone config:', error);
      setDroneConfig(null);
    });
  }, [selectedDronePath, onConfigLoaded]);
  
  // Debug: Log when config changes
  useEffect(() => {
    if (droneConfig) {
      console.log('📐 Applying drone config:', {
        path: selectedDronePath,
        size: droneConfig.targetSize,
        position: [droneConfig.position.x, droneConfig.position.y, droneConfig.position.z],
        rotation: [droneConfig.rotation.x, droneConfig.rotation.y, droneConfig.rotation.z],
      });
    }
  }, [droneConfig, selectedDronePath]);

  useEffect(() => {
    getModelConfig(selectedPlanePath).then((config) => {
      console.log('Plane config loaded:', selectedPlanePath, config);
      setPlaneConfig(config);
    });
  }, [selectedPlanePath]);

  // Memoize the onLoad callback to prevent infinite loops
  const handleDroneLoad = useCallback((model: THREE.Group, sdf: (pos: THREE.Vector3) => number & { __voxelGrid?: SDFVoxelGrid }, voxelGrid?: SDFVoxelGrid) => {
    setModelLoaded(true);
    setLoadedSDF(() => sdf);

    // Phase 2: Store voxel grid reference in SDF function if available
    if (voxelGrid) {
      (sdf as ((pos: THREE.Vector3) => number) & { __voxelGrid?: SDFVoxelGrid }).__voxelGrid = voxelGrid;
    }
    
    // Calculate bounding box for flow calculations
    const bounds = new THREE.Box3().setFromObject(model);
    
    console.log(
      `✅ Drone loaded: ${selectedDronePath} with ${useBoundingBoxSDF ? '📦 bounding box' : '✅ EXACT MESH'} SDF`
    );
    
    // CRITICAL: Pass SDF to parent for flow field integration
    // This connects the mesh SDF to the velocity field
    // Only call once when model loads, not on every render
    if (onSDFLoaded) {
      onSDFLoaded(sdf, bounds);
    }
  }, [selectedDronePath, useBoundingBoxSDF, onSDFLoaded]); // CRITICAL: useBoundingBoxSDF in deps to reload when mode changes

  // Calculate bounds for non-mesh obstacles and notify parent
  // This enables dynamic wind tunnel for all obstacle types
  useEffect(() => {
    if (!onBoundsLoaded) return;
    
    if (obstacleType === 'cylinder') {
      // Cylinder: radius 5, height 80 (horizontal, Z-axis aligned)
      // Dimensions: 10 (diameter) x 10 (diameter) x 80 (length)
      // Two largest: 80 (Z) and 10 (X or Y) → spawn area: 80 tall x 10 wide
      const radius = 5.0;
      const height = 80.0;
      const bounds = new THREE.Box3(
        new THREE.Vector3(-radius, -radius, -height / 2),
        new THREE.Vector3(radius, radius, height / 2)
      );
      onBoundsLoaded(bounds);
    } else if (obstacleType === 'sphere') {
      // Sphere: radius 5
      // Dimensions: 10 x 10 x 10 (all equal)
      // Two largest: 10 and 10 → spawn area: 10 x 10
      const radius = 5.0;
      const bounds = new THREE.Box3(
        new THREE.Vector3(-radius, -radius, -radius),
        new THREE.Vector3(radius, radius, radius)
      );
      onBoundsLoaded(bounds);
    } else if (obstacleType === 'box') {
      // Box: 10x10x10
      // Dimensions: 10 x 10 x 10 (all equal)
      // Two largest: 10 and 10 → spawn area: 10 x 10
      const size = 10.0;
      const bounds = new THREE.Box3(
        new THREE.Vector3(-size / 2, -size / 2, -size / 2),
        new THREE.Vector3(size / 2, size / 2, size / 2)
      );
      onBoundsLoaded(bounds);
    }
  }, [obstacleType, onBoundsLoaded]);

  if (obstacleType === 'none' || !obstacleType) {
    return null;
  }

  const obstacleColor = new THREE.Color(0.2, 0.4, 0.8); // Blue-ish
  const wireframeOpacity = 0.3;

  // Special handling for plane: load actual 3D model
  if (obstacleType === 'plane') {
    return (
      <group>
        <ModelLoader
          modelPath={selectedPlanePath}
          targetSize={planeConfig?.targetSize || 80}
          position={planeConfig ? [planeConfig.position.x, planeConfig.position.y, planeConfig.position.z] : [0, 0, 0]}
          rotation={planeConfig ? [planeConfig.rotation.x, planeConfig.rotation.y, planeConfig.rotation.z] : [0, 0, 0]}
          onLoad={() => setModelLoaded(true)}
          onError={(error) => console.error('Failed to load plane model:', error)}
        />
        {!modelLoaded && (
          // Fallback procedural plane while loading
          <group>
            <mesh position={[0, 0, 0]}>
              <capsuleGeometry args={[2, 15, 16, 32]} />
              <meshPhongMaterial color={0x333333} opacity={0.4} transparent />
            </mesh>
            <mesh position={[-6, 0, 0]} rotation={[Math.PI / 6, 0, 0]}>
              <boxGeometry args={[3, 12, 0.8]} />
              <meshPhongMaterial color={0x404080} opacity={0.35} transparent />
            </mesh>
            <mesh position={[6, 0, 0]} rotation={[Math.PI / 6, 0, 0]}>
              <boxGeometry args={[3, 12, 0.8]} />
              <meshPhongMaterial color={0x404080} opacity={0.35} transparent />
            </mesh>
          </group>
        )}
      </group>
    );
  }

  // Special handling for drone: load GLB model with SDF generation
  // Follows MeshSDF Infrastructure gold standard
  if (obstacleType === 'drone') {
    return (
      <group>
        <DroneLoader
          modelPath={selectedDronePath}
          targetSize={droneConfig?.targetSize || 60}
          position={droneConfig ? [droneConfig.position.x, droneConfig.position.y, droneConfig.position.z] : [0, 0, 0]}
          rotation={droneConfig ? [droneConfig.rotation.x, droneConfig.rotation.y, droneConfig.rotation.z] : [0, 0, 0]}
          useBoundingBoxSDF={useBoundingBoxSDF ?? false} // Default to exact mesh if not specified
          onLoad={handleDroneLoad}
          onError={(error) => console.error('Failed to load drone model:', error)}
        />
        {!modelLoaded && (
          // Fallback procedural drone while loading
          <group>
            {/* Main body */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[3, 1, 2]} />
              <meshPhongMaterial color={0x333333} opacity={0.4} transparent />
            </mesh>
            {/* Propellers (4 arms) */}
            <mesh position={[-4, 0, -4]}>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
              <meshPhongMaterial color={0x666666} opacity={0.5} transparent />
            </mesh>
            <mesh position={[4, 0, -4]}>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
              <meshPhongMaterial color={0x666666} opacity={0.5} transparent />
            </mesh>
            <mesh position={[-4, 0, 4]}>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
              <meshPhongMaterial color={0x666666} opacity={0.5} transparent />
            </mesh>
            <mesh position={[4, 0, 4]}>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
              <meshPhongMaterial color={0x666666} opacity={0.5} transparent />
            </mesh>
          </group>
        )}
      </group>
    );
  }

  return (
    <>
      {obstacleType === 'cylinder' && (
        <group>
          {/* Cylinder obstacle - horizontal (Z-axis aligned) to match flow simulation */}
          <mesh
            position={[0, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}  // Rotate 90° around X-axis (Y→Z)
          >
            <cylinderGeometry args={[5, 5, 80, 32]} />
            <meshPhongMaterial
              color={obstacleColor}
              opacity={wireframeOpacity}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Wireframe for visibility */}
          <lineSegments
            position={[0, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}  // Rotate wireframe to match
          >
            <cylinderGeometry args={[5, 5, 80, 32]} />
            <lineBasicMaterial color={0x4488ff} linewidth={2} />
          </lineSegments>
        </group>
      )}

      {obstacleType === 'sphere' && (
        <group>
          {/* Sphere obstacle */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[5, 32, 32]} />
            <meshPhongMaterial
              color={obstacleColor}
              opacity={wireframeOpacity}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Wireframe */}
          <lineSegments position={[0, 0, 0]}>
            <sphereGeometry args={[5, 16, 16]} />
            <lineBasicMaterial color={0x4488ff} linewidth={2} />
          </lineSegments>
        </group>
      )}

      {obstacleType === 'box' && (
        <group>
          {/* Box obstacle */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[6, 6, 6]} />
            <meshPhongMaterial
              color={obstacleColor}
              opacity={wireframeOpacity}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Wireframe */}
          <lineSegments position={[0, 0, 0]}>
            <boxGeometry args={[6, 6, 6]} />
            <lineBasicMaterial color={0x4488ff} linewidth={2} />
          </lineSegments>
        </group>
      )}

      {obstacleType === 'plane' && (
        <group>
          {/* Aircraft fuselage */}
          <mesh position={[0, 0, 0]}>
            <capsuleGeometry args={[2, 15, 16, 32]} />
            <meshPhongMaterial color={0x333333} opacity={0.4} transparent />
          </mesh>

          {/* Left wing */}
          <mesh position={[-6, 0, 0]} rotation={[Math.PI / 6, 0, 0]}>
            <boxGeometry args={[3, 12, 0.8]} />
            <meshPhongMaterial color={0x404080} opacity={0.35} transparent />
          </mesh>

          {/* Right wing */}
          <mesh position={[6, 0, 0]} rotation={[Math.PI / 6, 0, 0]}>
            <boxGeometry args={[3, 12, 0.8]} />
            <meshPhongMaterial color={0x404080} opacity={0.35} transparent />
          </mesh>

          {/* Vertical stabilizer (tail) */}
          <mesh position={[-7, 1, 0]} rotation={[0, 0, Math.PI / 8]}>
            <boxGeometry args={[3, 0.8, 4]} />
            <meshPhongMaterial color={0x404080} opacity={0.35} transparent />
          </mesh>

          {/* Fuselage outline */}
          <lineSegments position={[0, 0, 0]}>
            <capsuleGeometry args={[2, 15, 16, 16]} />
            <lineBasicMaterial color={0x6699ff} linewidth={2} />
          </lineSegments>

          {/* Cockpit/nose highlight */}
          <mesh position={[7.5, 0.5, 0]}>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshPhongMaterial color={0x8899ff} opacity={0.3} transparent />
          </mesh>
        </group>
      )}

      {obstacleType === 'airfoil' && (
        <group>
          {/* NACA airfoil profile (simplified 3D representation) */}
          {/* Main airfoil body */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
            <latheGeometry
              args={[
                [
                  new THREE.Vector2(0, 0),
                  new THREE.Vector2(1, 0.5),
                  new THREE.Vector2(2, 0.8),
                  new THREE.Vector2(3, 0.9),
                  new THREE.Vector2(4, 0.8),
                  new THREE.Vector2(5, 0.5),
                  new THREE.Vector2(6, 0),
                  new THREE.Vector2(5, -0.3),
                  new THREE.Vector2(4, -0.4),
                  new THREE.Vector2(3, -0.4),
                  new THREE.Vector2(2, -0.3),
                  new THREE.Vector2(1, -0.2),
                  new THREE.Vector2(0, 0),
                ],
                16,
                0,
                Math.PI * 2
              ]}
            />
            <meshPhongMaterial
              color={0x4466cc}
              opacity={0.35}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Airfoil wireframe */}
          <lineSegments position={[0, 0, 0]}>
            <boxGeometry args={[6, 1, 15]} />
            <lineBasicMaterial color={0x6699ff} linewidth={1} />
          </lineSegments>
        </group>
      )}
    </>
  );
}
