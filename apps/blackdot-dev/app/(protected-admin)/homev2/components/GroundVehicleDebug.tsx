/**
 * Ground Vehicle Debug Visualization
 * Shows paths, waypoints, zones, and collision bounds
 */

'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import type { GroundVehicleConfig } from '../config/scene.config';
import type { GroundVehicle } from '../hooks/useGroundVehicles';

export interface GroundVehicleDebugProps {
  config: GroundVehicleConfig;
  vehicles?: GroundVehicle[];
}

export function GroundVehicleDebug({ config, vehicles = [] }: GroundVehicleDebugProps) {
  const debug = config.debug || {};

  // Memoize shared geometries (fixed sizes)
  const sharedGeometries = useMemo(() => ({
    waypointSphere: new THREE.SphereGeometry(0.5, 8, 8),
  }), []);

  // Track dynamic geometries for cleanup
  const dynamicGeometriesRef = useRef<Set<THREE.BufferGeometry>>(new Set());

  // Cleanup all geometries on unmount
  useEffect(() => {
    return () => {
      // Dispose shared geometries
      sharedGeometries.waypointSphere.dispose();

      // Dispose dynamic geometries
      dynamicGeometriesRef.current.forEach(geo => geo.dispose());
      dynamicGeometriesRef.current.clear();
    };
  }, [sharedGeometries]);

  // Generate path curves for visualization
  const pathCurves = useMemo(() => {
    if (!debug.showPaths) return [];

    const curves: Array<{ id: string; points: THREE.Vector3[]; color: string }> = [];
    const groundLevel = config.groundPhysics.groundLevel;

    Object.entries(config.groundPaths).forEach(([pathId, path]) => {
      const points: THREE.Vector3[] = [];

      path.waypoints.forEach(waypointId => {
        const waypoint = config.groundWaypoints[waypointId];
        if (waypoint) {
          points.push(
            new THREE.Vector3(waypoint.position[0], groundLevel, waypoint.position[1])
          );
        }
      });

      if (points.length >= 2) {
        const tension = path.curveTension ?? 0.5;
        const curve = new THREE.CatmullRomCurve3(points, path.bidirectional ?? false, 'catmullrom', tension);
        const curvePoints = curve.getPoints(50);

        curves.push({
          id: pathId,
          points: curvePoints,
          color: path.bidirectional ? '#00FF00' : '#FFAA00',
        });
      }
    });

    return curves;
  }, [config, debug.showPaths]);

  // Waypoint markers
  const waypoints = useMemo(() => {
    if (!debug.showWaypoints) return [];

    const groundLevel = config.groundPhysics.groundLevel;
    return Object.values(config.groundWaypoints).map(waypoint => ({
      id: waypoint.id,
      position: new THREE.Vector3(waypoint.position[0], groundLevel + 0.5, waypoint.position[1]),
      type: waypoint.type,
      width: waypoint.width || 2.0,
    }));
  }, [config, debug.showWaypoints]);

  return (
    <group name="ground-vehicle-debug">
      {/* Path visualization */}
      {debug.showPaths && pathCurves.map(curve => (
        <Line
          key={curve.id}
          points={curve.points}
          color={curve.color}
          lineWidth={2}
          dashed={false}
        />
      ))}

      {/* Waypoint markers */}
      {debug.showWaypoints && waypoints.map(waypoint => (
        <group key={waypoint.id} position={waypoint.position}>
          {/* Waypoint sphere - using memoized geometry */}
          <mesh geometry={sharedGeometries.waypointSphere}>
            <meshBasicMaterial
              color={getWaypointColor(waypoint.type)}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Waypoint zone (width indicator) */}
          {/* Note: Dynamic size per waypoint - R3F handles disposal automatically */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <ringGeometry args={[waypoint.width * 0.8, waypoint.width, 16]} />
            <meshBasicMaterial
              color={getWaypointColor(waypoint.type)}
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* Vehicle collision bounds */}
      {/* Note: Dynamic size per vehicle - R3F handles disposal automatically */}
      {debug.showCollisionBounds && vehicles.map(vehicle => (
        <mesh
          key={vehicle.id}
          position={[vehicle.position.x, config.groundPhysics.groundLevel + 0.1, vehicle.position.z]}
        >
          <cylinderGeometry args={[vehicle.collisionRadius, vehicle.collisionRadius, 0.2, 16]} />
          <meshBasicMaterial
            color="#FF0000"
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}

      {/* Ground plane grid (always shown for reference) */}
      <gridHelper
        args={[200, 40, '#333333', '#666666']}
        position={[0, config.groundPhysics.groundLevel, 0]}
      />
    </group>
  );
}

/**
 * Get color based on waypoint type
 */
function getWaypointColor(type: string): string {
  switch (type) {
    case 'parking':
      return '#4169E1'; // Blue
    case 'intersection':
      return '#FFD700'; // Gold
    case 'queue_start':
    case 'queue_end':
      return '#FF6347'; // Tomato
    case 'loading':
      return '#32CD32'; // Lime green
    case 'service':
      return '#FF8C00'; // Dark orange
    case 'runway_service':
      return '#9370DB'; // Medium purple
    default:
      return '#FFFFFF'; // White
  }
}
