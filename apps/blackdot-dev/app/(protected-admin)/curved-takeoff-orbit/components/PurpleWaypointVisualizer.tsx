'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import {
  calculatePurpleWaypoints,
  createDefaultWaypointConfig,
  createWaypointVisualization,
  type WaypointCalculationConfig,
} from '../lib/waypointCalculator';

interface PurpleWaypointVisualizerProps {
  // Required waypoints
  green: THREE.Vector3;
  yellow: THREE.Vector3;
  blue: THREE.Vector3;

  // Orbit configuration
  orbitCenter: THREE.Vector3;
  orbitRadius: number;
  orbitSpeed?: number;

  // Visual options
  showLabels?: boolean;
  showVelocityVectors?: boolean;
  showCurve?: boolean;
  showMetadata?: boolean;

  // Physics overrides
  physicsConfig?: Partial<WaypointCalculationConfig['physics']>;
  trajectoryConfig?: Partial<WaypointCalculationConfig['trajectory']>;
}

/**
 * Purple Waypoint Visualizer
 *
 * Renders auto-calculated purple waypoints from green+yellow+blue
 * Shows physics-accurate trajectory with velocity vectors
 *
 * Usage:
 * ```tsx
 * <PurpleWaypointVisualizer
 *   green={new THREE.Vector3(-40, 0, -40)}
 *   yellow={new THREE.Vector3(-30, 12, -37)}
 *   blue={new THREE.Vector3(6, 30, 25)}
 *   orbitCenter={new THREE.Vector3(6, 30, 0)}
 *   orbitRadius={25}
 *   showLabels={true}
 *   showVelocityVectors={true}
 * />
 * ```
 */
export function PurpleWaypointVisualizer({
  green,
  yellow,
  blue,
  orbitCenter,
  orbitRadius,
  orbitSpeed = 0.6,
  showLabels = true,
  showVelocityVectors = false,
  showCurve = true,
  showMetadata = false,
  physicsConfig = {},
  trajectoryConfig = {},
}: PurpleWaypointVisualizerProps) {
  // Calculate purple waypoints
  const waypointData = useMemo(() => {
    const config = createDefaultWaypointConfig(green, yellow, blue, orbitCenter, orbitRadius);

    // Apply user overrides
    config.physics = { ...config.physics, ...physicsConfig };
    config.trajectory = { ...config.trajectory, ...trajectoryConfig };
    config.orbit.nominalSpeed = orbitSpeed;

    const result = calculatePurpleWaypoints(config);
    const viz = createWaypointVisualization(result, config);

    return { result, viz, config };
  }, [green, yellow, blue, orbitCenter, orbitRadius, orbitSpeed, physicsConfig, trajectoryConfig]);

  const { result, viz, config } = waypointData;

  // Curve points for rendering
  const curvePoints = useMemo(() => {
    return result.curve.getPoints(100);
  }, [result.curve]);

  return (
    <group>
      {/* ===================================================================== */}
      {/* GREEN WAYPOINT (Spawn) */}
      {/* ===================================================================== */}
      <mesh position={viz.green.position}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial color={viz.green.color} emissive={viz.green.color} emissiveIntensity={0.5} />
      </mesh>
      {showLabels && (
        <Html position={viz.green.position} center>
          <div
            style={{
              background: viz.green.color,
              color: '#000',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
            }}
          >
            {viz.green.label}
          </div>
        </Html>
      )}

      {/* ===================================================================== */}
      {/* YELLOW WAYPOINT (Release) */}
      {/* ===================================================================== */}
      <mesh position={viz.yellow.position}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial color={viz.yellow.color} emissive={viz.yellow.color} emissiveIntensity={0.5} />
      </mesh>
      {showLabels && (
        <Html position={viz.yellow.position} center>
          <div
            style={{
              background: viz.yellow.color,
              color: '#000',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
            }}
          >
            {viz.yellow.label}
          </div>
        </Html>
      )}

      {/* ===================================================================== */}
      {/* PURPLE WAYPOINTS (Auto-calculated) */}
      {/* ===================================================================== */}
      {viz.purple.map((waypoint, idx) => (
        <group key={`purple-${idx}`}>
          <mesh position={waypoint.position}>
            <sphereGeometry args={[1.0, 16, 16]} />
            <meshStandardMaterial color={waypoint.color} emissive={waypoint.color} emissiveIntensity={0.5} />
          </mesh>
          {showLabels && (
            <Html position={waypoint.position} center>
              <div
                style={{
                  background: waypoint.color,
                  color: '#fff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                }}
              >
                {waypoint.label}
              </div>
            </Html>
          )}
        </group>
      ))}

      {/* ===================================================================== */}
      {/* BLUE WAYPOINT (Gate) */}
      {/* ===================================================================== */}
      <mesh position={viz.blue.position}>
        <sphereGeometry args={[2.0, 16, 16]} />
        <meshStandardMaterial color={viz.blue.color} emissive={viz.blue.color} emissiveIntensity={0.5} />
      </mesh>
      {showLabels && (
        <Html position={viz.blue.position} center>
          <div
            style={{
              background: viz.blue.color,
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
            }}
          >
            {viz.blue.label}
          </div>
        </Html>
      )}

      {/* ===================================================================== */}
      {/* TRAJECTORY CURVE */}
      {/* ===================================================================== */}
      {showCurve && (
        <Line
          points={curvePoints}
          color="#ff00ff"
          lineWidth={3}
          opacity={0.6}
          transparent
        />
      )}

      {/* ===================================================================== */}
      {/* VELOCITY VECTORS */}
      {/* ===================================================================== */}
      {showVelocityVectors && result.velocities.map((velocity, idx) => {
        const position = result.purpleWaypoints[idx];
        if (!position || !velocity) return null;

        const arrowEnd = position.clone().add(velocity.clone().normalize().multiplyScalar(5));

        return (
          <group key={`velocity-${idx}`}>
            <Line
              points={[position, arrowEnd]}
              color="#00ffff"
              lineWidth={2}
              opacity={0.7}
              transparent
            />
            <mesh position={arrowEnd}>
              <coneGeometry args={[0.5, 1.5, 8]} />
              <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
            </mesh>
          </group>
        );
      })}

      {/* ===================================================================== */}
      {/* FINAL VELOCITY VECTOR (at blue gate) */}
      {/* ===================================================================== */}
      {showVelocityVectors && (
        <group>
          {/* Final velocity from trajectory */}
          <Line
            points={[
              blue,
              blue.clone().add(result.metadata.finalVelocity.clone().normalize().multiplyScalar(8)),
            ]}
            color="#ff00ff"
            lineWidth={3}
            opacity={0.8}
            transparent
          />

          {/* Target orbit velocity */}
          <Line
            points={[
              blue,
              blue.clone().add(result.metadata.orbitTangentVelocity.clone().normalize().multiplyScalar(8)),
            ]}
            color="#00ff00"
            lineWidth={3}
            opacity={0.8}
            transparent
          />
        </group>
      )}

      {/* ===================================================================== */}
      {/* METADATA DISPLAY */}
      {/* ===================================================================== */}
      {showMetadata && (
        <Html position={[orbitCenter.x, orbitCenter.y + 15, orbitCenter.z]} center>
          <div
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#ff00ff' }}>
              Purple Waypoint Trajectory
            </div>
            <div>Duration: {result.metadata.trajectoryDuration.toFixed(2)}s</div>
            <div>Peak Height: {result.metadata.peakHeight.toFixed(2)}</div>
            <div>Total Distance: {result.metadata.totalDistance.toFixed(2)}</div>
            <div>Purple Waypoints: {result.purpleWaypoints.length}</div>
            <div style={{ marginTop: '8px', borderTop: '1px solid #444', paddingTop: '8px' }}>
              <div style={{ color: '#ff00ff' }}>
                Final Velocity: {result.metadata.finalVelocity.length().toFixed(2)} m/s
              </div>
              <div style={{ color: '#00ff00' }}>
                Orbit Velocity: {result.metadata.orbitTangentVelocity.length().toFixed(2)} m/s
              </div>
              <div style={{ color: result.metadata.velocityMismatch > 5 ? '#ff0000' : '#00ff00' }}>
                Mismatch: {result.metadata.velocityMismatch.toFixed(3)} m/s
              </div>
            </div>
            <div style={{ marginTop: '8px', borderTop: '1px solid #444', paddingTop: '8px', fontSize: '10px' }}>
              <div>Gravity: {config.physics.gravity.toFixed(1)} m/s²</div>
              <div>Initial Velocity: {config.physics.initialVelocity.toFixed(1)} m/s</div>
              <div>Drag: {config.physics.dragCoefficient.toFixed(2)}</div>
              <div>Smoothing: {config.trajectory.smoothingFactor.toFixed(2)}</div>
            </div>
          </div>
        </Html>
      )}

      {/* ===================================================================== */}
      {/* CONNECTION LINES (green → yellow → blue) */}
      {/* ===================================================================== */}
      <Line
        points={[green, yellow]}
        color="#00ff00"
        lineWidth={2}
        opacity={0.3}
        transparent
        dashed
        dashScale={2}
        dashSize={1}
        gapSize={1}
      />
      <Line
        points={[yellow, blue]}
        color="#ffff00"
        lineWidth={2}
        opacity={0.3}
        transparent
        dashed
        dashScale={2}
        dashSize={1}
        gapSize={1}
      />
    </group>
  );
}

/**
 * Helper component: Show multiple sources with purple waypoints
 */
interface MultiSourcePurpleVisualizerProps {
  sources: Array<{
    id: string;
    green: THREE.Vector3;
    yellow: THREE.Vector3;
    blue: THREE.Vector3;
  }>;
  orbitCenter: THREE.Vector3;
  orbitRadius: number;
  showLabels?: boolean;
  showVelocityVectors?: boolean;
}

export function MultiSourcePurpleVisualizer({
  sources,
  orbitCenter,
  orbitRadius,
  showLabels = true,
  showVelocityVectors = false,
}: MultiSourcePurpleVisualizerProps) {
  return (
    <group>
      {sources.map(source => (
        <PurpleWaypointVisualizer
          key={source.id}
          green={source.green}
          yellow={source.yellow}
          blue={source.blue}
          orbitCenter={orbitCenter}
          orbitRadius={orbitRadius}
          showLabels={showLabels}
          showVelocityVectors={showVelocityVectors}
          showCurve={true}
          showMetadata={false}
        />
      ))}
    </group>
  );
}
