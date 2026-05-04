/**
 * Ground Vehicle System
 * Main component that integrates ground vehicle movement with the scene
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { GroundVehicleConfig } from '../config/scene.config';
import { useGroundVehicles } from '../hooks/useGroundVehicles';
import { GroundVehicleDebug } from './GroundVehicleDebug';
import { getModelConfig } from '../config/scene.config';

export interface GroundVehicleSystemProps {
  config: GroundVehicleConfig;
  enabled?: boolean;
  showDebug?: boolean;
}

export function GroundVehicleSystem({
  config,
  enabled = true,
  showDebug = true,
}: GroundVehicleSystemProps) {
  const { vehicles, fleetInstances, vehicleCount, fleetCount } = useGroundVehicles({
    config,
    enabled,
  });

  // Get unique model IDs needed
  const modelIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(config.groundFleets).forEach(fleet => {
      ids.add(fleet.modelId);
    });
    return Array.from(ids);
  }, [config]);

  // Load all required models
  // Note: In production, you'd want proper model loading with fallbacks
  // For now, we'll use simple box geometries as placeholders

  if (!enabled || !config.enabled || vehicleCount === 0) {
    return null;
  }

  return (
    <group name="ground-vehicle-system">
      {/* Multi-fleet vehicle instances */}
      {Array.from(fleetInstances.values()).map((fleetInstance) => (
        <FleetInstancedMesh key={fleetInstance.fleetId} fleetInstance={fleetInstance} />
      ))}

      {/* Debug visualization */}
      {showDebug && <GroundVehicleDebug config={config} vehicles={vehicles} />}
    </group>
  );
}

/**
 * Instanced mesh for a single fleet
 */
interface FleetInstancedMeshProps {
  fleetInstance: import('../hooks/useGroundVehicles').FleetInstance;
}

function FleetInstancedMesh({ fleetInstance }: FleetInstancedMeshProps) {
  const { fleetId, vehicles, instancedMeshRef, geometry, material } = fleetInstance;

  return (
    <instancedMesh
      ref={instancedMeshRef as React.RefObject<THREE.InstancedMesh>}
      args={[geometry, material, vehicles.length]}
      name={`fleet-${fleetId}`}
    />
  );
}

/**
 * Individual vehicle model (for non-instanced rendering)
 * Use this if you need different models per vehicle
 */
interface VehicleModelProps {
  modelId: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  color: string;
  emissive: string;
}

function VehicleModel({ modelId, position, rotation, color, emissive }: VehicleModelProps) {
  // Attempt to load model, fall back to box
  // const { scene } = useGLTF(getModelConfig(modelId)?.path || '');

  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[2, 1, 3]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.3} />
    </mesh>
  );
}
