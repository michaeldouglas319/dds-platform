/**
 * V3 Debug Overlay
 *
 * Visual debugging for trajectories, gates, and orbit zones
 */

'use client';

import * as THREE from 'three';
import { Line } from '@react-three/drei';
import type { V3Config } from '../config/v3.config';
import type { V3TrajectoriesState } from '../hooks/useV3Trajectories';
import type { V3BlueGatesState } from '../hooks/useV3BlueGates';

interface V3DebugOverlayProps {
  config: V3Config;
  trajectories: V3TrajectoriesState;
  blueGates: V3BlueGatesState;
  showTrajectories?: boolean;
  showGates?: boolean;
  showOrbit?: boolean;
}

export function V3DebugOverlay({
  config,
  trajectories,
  blueGates,
  showTrajectories = true,
  showGates = true,
  showOrbit = true,
}: V3DebugOverlayProps) {
  // Generate orbit ring points
  const orbitPoints = [];
  const segments = 64;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    orbitPoints.push(
      new THREE.Vector3(
        config.orbit.center.x + Math.cos(angle) * config.orbit.radius,
        config.orbit.center.y,
        config.orbit.center.z + Math.sin(angle) * config.orbit.radius
      )
    );
  }

  return (
    <group>
      {/* Orbit ring */}
      {showOrbit && (
        <Line points={orbitPoints} color="hotpink" lineWidth={2} dashed={false} />
      )}

      {/* Trajectory curves */}
      {showTrajectories &&
        Array.from(trajectories.trajectories.entries()).map(([sourceId, trajectory]) => {
          const takeoffPoints = trajectory.takeoffCurve.getPoints(50);
          const landingPoints = trajectory.landingCurve.getPoints(50);

          return (
            <group key={sourceId}>
              {/* Takeoff curve */}
              <Line points={takeoffPoints} color="yellow" lineWidth={1} dashed={true} />
              {/* Landing curve */}
              <Line points={landingPoints} color="green" lineWidth={1} dashed={true} />
            </group>
          );
        })}

      {/* Blue gates */}
      {showGates &&
        Array.from(blueGates.gates.values()).map((gate) => (
          <mesh key={gate.sourceId} position={gate.config.position}>
            <sphereGeometry args={[gate.config.radius, 16, 16]} />
            <meshBasicMaterial color="blue" transparent opacity={0.3} wireframe />
          </mesh>
        ))}

      {/* Spawn points */}
      {config.sources.map((source) => (
        <mesh key={source.id} position={source.gatePosition}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={source.particleColor} />
        </mesh>
      ))}
    </group>
  );
}
