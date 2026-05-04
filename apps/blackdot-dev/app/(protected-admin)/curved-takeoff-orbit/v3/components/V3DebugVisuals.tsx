/**
 * V3 Debug Visuals
 *
 * Visual helpers for debugging trajectories, gates, and zones
 */

'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import type { V3Config } from '../config/v3.config';
import type { V3TrajectoriesState } from '../hooks/useV3Trajectories';
import type { V3ParticlesState } from '../hooks/useV3Particles';
import { calculateAssemblyVisuals, getHealthColor } from '../hooks/useV3Extended';

interface V3DebugVisualsProps {
  config: V3Config;
  trajectories: V3TrajectoriesState;
  particles: V3ParticlesState;
}

export function V3DebugVisuals({ config, trajectories, particles }: V3DebugVisualsProps) {
  const { debug } = config;

  // Generate orbit circle points (must be before early return)
  const orbitPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          config.orbit.center.x + Math.cos(angle) * config.orbit.radius,
          config.orbit.center.y,
          config.orbit.center.z + Math.sin(angle) * config.orbit.radius
        )
      );
    }
    return points;
  }, [config.orbit]);

  if (!trajectories.isReady) return null;

  return (
    <>
      {/* Orbit Path */}
      {debug.showOrbitPath && (
        <Line
          points={orbitPoints}
          color="#4ade80"
          lineWidth={2}
          dashed={false}
        />
      )}

      {/* Trajectories and Waypoints */}
      {Array.from(trajectories.trajectories.entries()).map(([sourceId, traj]) => {
        // Get points along curves
        const takeoffPoints = traj.takeoffCurve.getPoints(50);
        const landingPoints = traj.landingCurve.getPoints(50);

        // Get waypoints
        const takeoffWaypoints = (traj.takeoffCurve as any).points || [];
        const landingWaypoints = (traj.landingCurve as any).points || [];

        return (
          <group key={sourceId}>
            {/* Takeoff Curve */}
            {debug.showTrajectories && (
              <Line
                points={takeoffPoints}
                color="#fbbf24"
                lineWidth={2}
                dashed={true}
              />
            )}

            {/* Landing Curve */}
            {debug.showTrajectories && (
              <Line
                points={landingPoints}
                color="#fb923c"
                lineWidth={2}
                dashed={true}
              />
            )}

            {/* Takeoff Waypoints */}
            {debug.showWaypoints &&
              takeoffWaypoints.map((point: THREE.Vector3, idx: number) => (
                <mesh key={`takeoff-wp-${idx}`} position={point}>
                  <sphereGeometry args={[0.5, 16, 16]} />
                  <meshBasicMaterial color="#fbbf24" />
                </mesh>
              ))}

            {/* Landing Waypoints (Exit - Purple) */}
            {debug.showWaypoints &&
              landingWaypoints.map((point: THREE.Vector3, idx: number) => (
                <mesh key={`landing-wp-${idx}`} position={point}>
                  <sphereGeometry args={[0.6, 16, 16]} />
                  <meshBasicMaterial color="#a855f7" />
                </mesh>
              ))}

            {/* Blue Gate Zone */}
            {debug.showGateZones && (
              <mesh position={traj.blueGatePosition}>
                <torusGeometry args={[config.blueGate.radius, 0.5, 16, 32]} />
                <meshBasicMaterial
                  color="#3b82f6"
                  transparent
                  opacity={0.3}
                  wireframe
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Handoff Zone Visualization */}
      {debug.showHandoffZone &&
        Array.from(trajectories.trajectories.entries()).map(([sourceId, traj]) => {
          // Get points at 85% and 95%
          const handoffStart = traj.takeoffCurve.getPoint(0.85);
          const handoffEnd = traj.blueGatePosition; // Use exact blue gate position instead of curve interpolation

          return (
            <group key={`handoff-${sourceId}`}>
              {/* Start marker */}
              <mesh position={handoffStart}>
                <sphereGeometry args={[1.0, 16, 16]} />
                <meshBasicMaterial color="#10b981" opacity={0.6} transparent />
              </mesh>

              {/* End marker - NOW ALIGNED WITH LANDING START */}
              <mesh position={handoffEnd}>
                <sphereGeometry args={[1.0, 16, 16]} />
                <meshBasicMaterial color="#ef4444" opacity={0.6} transparent />
              </mesh>

              {/* Zone highlight */}
              <Line
                points={traj.takeoffCurve.getPoints(50).slice(42, 48)} // Approx 85-95%
                color="#8b5cf6"
                lineWidth={4}
                dashed={false}
              />
            </group>
          );
        })}

      {/* Blue Gate Center Points */}
      {debug.showBluGateCenter &&
        Array.from(trajectories.trajectories.entries()).map(([sourceId, traj]) => (
          <mesh key={`gate-center-${sourceId}`} position={traj.blueGatePosition}>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}

      {/* Exit Capture Zones - Distance Rings */}
      {debug.showExitCaptureZones &&
        Array.from(trajectories.trajectories.entries()).map(([sourceId, traj]) => {
          // Pre-landing zone (outer ring - orange)
          const preLandingDistance = config.landingTransition.preLandingDistance;
          // Capture zone (inner ring - red)
          const captureDistance = config.landingTransition.captureDistance;

          return (
            <group key={`exit-zones-${sourceId}`}>
              {/* Pre-landing zone ring (orange, larger) */}
              <mesh position={traj.blueGatePosition}>
                <torusGeometry args={[preLandingDistance, 0.3, 16, 32]} />
                <meshBasicMaterial
                  color="#f59e0b"
                  transparent
                  opacity={0.5}
                  wireframe={false}
                />
              </mesh>

              {/* Capture zone ring (red, smaller) */}
              <mesh position={traj.blueGatePosition}>
                <torusGeometry args={[captureDistance, 0.4, 16, 32]} />
                <meshBasicMaterial
                  color="#ef4444"
                  transparent
                  opacity={0.7}
                  wireframe={false}
                />
              </mesh>

              {/* Center marker */}
              <mesh position={traj.blueGatePosition}>
                <sphereGeometry args={[0.8, 8, 8]} />
                <meshBasicMaterial color="#fbbf24" />
              </mesh>
            </group>
          );
        })}

      {/* Collision Shapes (shape-aware visualization) */}
      {debug.showCollisionSpheres &&
        particles.particles.map((particle, idx) => {
          const { shape, dimensions, offset } = config.collision;
          const collisionCenter = particle.position.clone().add(
            new THREE.Vector3(offset.x, offset.y, offset.z)
          );

          return (
            <mesh
              key={`collision-${idx}`}
              position={collisionCenter}
              scale={[dimensions.width, dimensions.height, dimensions.depth]}
            >
              {shape === 'sphere' || shape === 'ellipsoid' ? (
                <sphereGeometry args={[1, 16, 16]} />
              ) : shape === 'squircle' ? (
                // Use subdivided box as approximation for squircle
                <boxGeometry args={[1, 1, 1, 8, 8, 8]} />
              ) : (
                // Box (AABB)
                <boxGeometry args={[1, 1, 1]} />
              )}
              <meshBasicMaterial
                color="#00ffff"
                transparent
                opacity={0.15}
                wireframe
              />
            </mesh>
          );
        })}

      {/* Assembly Progress Spheres */}
      {debug.showAssemblyProgress &&
        particles.particles.map((particle, idx) => {
          if (!config.assembly.enabled || particle.phase !== 'orbit') return null;

          const visualScale = particle.assemblyVisualScale ?? 1.0;
          const sphereScale = visualScale * 2.0; // 2x for visibility

          return (
            <mesh key={`assembly-${idx}`} position={particle.position}>
              <sphereGeometry args={[sphereScale, 8, 8]} />
              <meshBasicMaterial
                color="#00ffff"
                transparent
                opacity={0.2}
                wireframe
              />
            </mesh>
          );
        })}

      {/* Health Color Indicator Spheres */}
      {debug.showHealthIndicators && config.health.enabled && config.health.visual.colorHealthIndicator &&
        particles.particles.map((particle, idx) => {
          const healthPercent = particle.health.current / particle.health.max;
          const healthColor = getHealthColor(healthPercent);

          return (
            <mesh key={`health-${idx}`} position={particle.position}>
              <sphereGeometry args={[1.5, 12, 12]} />
              <meshBasicMaterial
                color={healthColor}
                transparent
                opacity={0.3}
              />
            </mesh>
          );
        })}

      {/* Physics Bounds - Donut Thickness Visualization */}
      {debug.showPhysicsBounds && (
        <group>
          {/* Inner boundary */}
          <mesh position={config.orbit.center}>
            <torusGeometry args={[
              config.orbit.radius - config.physics.donutThickness / 2,  // Inner radius
              0.3,  // Tube thickness (visual only)
              16,
              64
            ]} />
            <meshBasicMaterial
              color="#ff00ff"
              transparent
              opacity={0.2}
              wireframe
            />
          </mesh>

          {/* Outer boundary */}
          <mesh position={config.orbit.center}>
            <torusGeometry args={[
              config.orbit.radius + config.physics.donutThickness / 2,  // Outer radius
              0.3,  // Tube thickness (visual only)
              16,
              64
            ]} />
            <meshBasicMaterial
              color="#ff00ff"
              transparent
              opacity={0.2}
              wireframe
            />
          </mesh>
        </group>
      )}

      {/* Taxi Paths & Staging Zones */}
      {debug.showTaxiPaths && config.taxiStaging.enabled && (
        <>
          {/* Staging Zones */}
          {config.taxiStaging.stagingZones.map((zone) => {
            // Color based on purpose
            const zoneColor =
              zone.purpose === 'loading' ? '#3b82f6' :  // blue
              zone.purpose === 'repair' ? '#10b981' :   // green
              zone.purpose === 'preparation' ? '#f59e0b' : // orange
              '#8b5cf6'; // purple for inspection

            return (
              <group key={zone.id}>
                {/* Zone marker (box) */}
                <mesh position={zone.position}>
                  <boxGeometry args={[zone.capacity * 2, 0.5, zone.capacity * 2]} />
                  <meshBasicMaterial
                    color={zoneColor}
                    transparent
                    opacity={0.2}
                    wireframe
                  />
                </mesh>
                {/* Zone label sphere */}
                <mesh position={[zone.position.x, zone.position.y + 2, zone.position.z]}>
                  <sphereGeometry args={[0.8, 8, 8]} />
                  <meshBasicMaterial color={zoneColor} />
                </mesh>
              </group>
            );
          })}

          {/* Taxi Paths for particles */}
          {particles.particles.map((particle, idx) => {
            if (!particle.taxiPath) return null;

            const pathPoints = particle.taxiPath.curve.getPoints(30);

            return (
              <group key={`taxi-${idx}`}>
                {/* Path curve */}
                <Line
                  points={pathPoints}
                  color="#fbbf24"
                  lineWidth={1}
                  dashed={true}
                />
                {/* Current position on path */}
                <mesh position={particle.position}>
                  <sphereGeometry args={[0.3, 8, 8]} />
                  <meshBasicMaterial color="#fbbf24" />
                </mesh>
              </group>
            );
          })}
        </>
      )}
    </>
  );
}
