/**
 * McLaren Circuit Component
 * Renders McLaren F1 vehicles circling the scene edge
 */

'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface McLarenVehicle {
  id: number;
  angle: number; // Current angle around circle
  speed: number; // Radians per second
  offset: number; // Initial angle offset
}

interface McLarenCircuitProps {
  radius?: number;
  vehicleCount?: number;
  speed?: number;
  groundLevel?: number;
  enabled?: boolean;
}

export function McLarenCircuit({
  radius = 70,
  vehicleCount = 10,
  speed = 0.3,
  groundLevel = 1,
  enabled = true,
}: McLarenCircuitProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Load McLaren F1 model
  const { scene: mclarenModel } = useGLTF('/assets/models/mclaren_f1lm_-_low_poly.glb');

  // Create vehicles with initial positions
  const vehicles = useMemo<McLarenVehicle[]>(() => {
    const veh: McLarenVehicle[] = [];
    for (let i = 0; i < vehicleCount; i++) {
      veh.push({
        id: i,
        angle: (i / vehicleCount) * Math.PI * 2, // Evenly spaced
        speed: speed + (Math.random() * 0.1 - 0.05), // Slight variation
        offset: (i / vehicleCount) * Math.PI * 2,
      });
    }
    return veh;
  }, [vehicleCount, speed]);

  // Animation loop
  useFrame((state, delta) => {
    if (!enabled || !groupRef.current) return;

    vehicles.forEach((vehicle, index) => {
      // Update angle
      vehicle.angle += vehicle.speed * delta;
      if (vehicle.angle > Math.PI * 2) {
        vehicle.angle -= Math.PI * 2;
      }

      // Calculate position on circle
      const x = Math.cos(vehicle.angle) * radius;
      const z = Math.sin(vehicle.angle) * radius;

      // Get or create child mesh
      const child = groupRef.current!.children[index];
      if (child) {
        child.position.set(x, groundLevel, z);

        // Point in direction of movement (tangent to circle)
        const tangentAngle = vehicle.angle + Math.PI / 2;
        child.rotation.y = tangentAngle;
      }
    });
  });

  if (!enabled) return null;

  return (
    <group ref={groupRef} name="mclaren-circuit">
      {vehicles.map((vehicle) => {
        // Calculate initial position
        const x = Math.cos(vehicle.angle) * radius;
        const z = Math.sin(vehicle.angle) * radius;
        const tangentAngle = vehicle.angle + Math.PI / 2;

        return (
          <primitive
            key={vehicle.id}
            object={mclarenModel.clone()}
            position={[x, groundLevel, z]}
            rotation={[0, tangentAngle, 0]}
            scale={0.5}
          />
        );
      })}
    </group>
  );
}

// Preload McLaren model
useGLTF.preload('/assets/models/mclaren_f1lm_-_low_poly.glb');
