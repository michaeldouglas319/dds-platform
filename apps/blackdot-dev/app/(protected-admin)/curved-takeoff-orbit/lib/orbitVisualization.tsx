/**
 * Orbit Zone Visualization
 *
 * Renders orbit as a 3D donut/torus showing the actual flyable volume.
 */

import { useMemo } from 'react';
import * as THREE from 'three';

export interface OrbitZoneProps {
  center: THREE.Vector3;
  radius: number;

  // Donut dimensions
  radialThickness?: number;      // How thick the donut tube is (radial variation)
  verticalHeight?: number;        // How tall the donut is (vertical oscillation)

  // Visual
  color?: string;
  opacity?: number;
  wireframe?: boolean;
  visible?: boolean;
}

/**
 * 3D Donut visualization of orbit zone
 */
export function OrbitZoneDonut({
  center,
  radius,
  radialThickness = 3.0,
  verticalHeight = 3.0,
  color = '#4444ff',
  opacity = 0.3,
  wireframe = false,
  visible = true
}: OrbitZoneProps) {
  // Torus geometry
  // radius = major radius (center of donut to center of tube)
  // tube = minor radius (tube thickness)
  const geometry = useMemo(() => {
    // Tube radius is half the radial thickness
    const tubeRadius = radialThickness / 2;

    // Create torus
    const geom = new THREE.TorusGeometry(
      radius,        // Major radius
      tubeRadius,    // Tube radius (thickness)
      16,            // Radial segments
      64             // Tubular segments (smoothness)
    );

    // Scale vertically to show oscillation height
    if (verticalHeight !== radialThickness) {
      const verticalScale = verticalHeight / radialThickness;
      geom.scale(1, verticalScale, 1);
    }

    return geom;
  }, [radius, radialThickness, verticalHeight]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity,
        wireframe,
        side: THREE.DoubleSide,
        depthWrite: false // Allow seeing through
      }),
    [color, opacity, wireframe]
  );

  if (!visible) return null;

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={center}
    />
  );
}

/**
 * Dual-ring visualization (inner + outer bounds)
 * Alternative to solid donut
 */
export function OrbitZoneRings({
  center,
  radius,
  radialThickness = 3.0,
  verticalHeight = 3.0,
  color = '#4444ff',
  opacity = 0.5,
  visible = true
}: OrbitZoneProps) {
  const innerRadius = radius - radialThickness / 2;
  const outerRadius = radius + radialThickness / 2;

  const createRingGeometry = (r: number) => {
    const points: THREE.Vector3[] = [];
    const segments = 128;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      points.push(new THREE.Vector3(x, 0, z));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  };

  const innerGeometry = useMemo(() => createRingGeometry(innerRadius), [innerRadius]);
  const outerGeometry = useMemo(() => createRingGeometry(outerRadius), [outerRadius]);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        linewidth: 2
      }),
    [color, opacity]
  );

  if (!visible) return null;

  return (
    <group position={center}>
      {/* Inner ring */}
      <primitive object={new THREE.Line(innerGeometry, material)} />

      {/* Outer ring */}
      <primitive object={new THREE.Line(outerGeometry, material)} />

      {/* Top rings (if vertical height > 0) */}
      {verticalHeight > 0 && (
        <>
          <group position={[0, verticalHeight / 2, 0]}>
            <primitive object={new THREE.Line(innerGeometry, material)} />
            <primitive object={new THREE.Line(outerGeometry, material)} />
          </group>
          <group position={[0, -verticalHeight / 2, 0]}>
            <primitive object={new THREE.Line(innerGeometry, material)} />
            <primitive object={new THREE.Line(outerGeometry, material)} />
          </group>
        </>
      )}
    </group>
  );
}

/**
 * Wireframe donut (lighter weight)
 */
export function OrbitZoneWireframe({
  center,
  radius,
  radialThickness = 3.0,
  verticalHeight = 3.0,
  color = '#4444ff',
  opacity = 0.6,
  visible = true
}: OrbitZoneProps) {
  return (
    <OrbitZoneDonut
      center={center}
      radius={radius}
      radialThickness={radialThickness}
      verticalHeight={verticalHeight}
      color={color}
      opacity={opacity}
      wireframe={true}
      visible={visible}
    />
  );
}

/**
 * Automatic donut sizing from config
 */
export interface AutoOrbitZoneProps {
  config: {
    orbit: {
      center: THREE.Vector3;
      radius: number;
    };
    sources: Array<{
      orbit?: {
        radialOffset?: number;
        verticalOscillation?: {
          enabled: boolean;
          amplitude: number;
        };
      };
    }>;
  };
  visualMode?: 'solid' | 'wireframe' | 'rings';
  color?: string;
  opacity?: number;
  visible?: boolean;
}

export function AutoOrbitZone({
  config,
  visualMode = 'wireframe',
  color = '#4444ff',
  opacity = 0.3,
  visible = true
}: AutoOrbitZoneProps) {
  // Calculate max radial variation from sources
  const maxRadialOffset = useMemo(() => {
    let max = 0;
    for (const source of config.sources) {
      const offset = Math.abs(source.orbit?.radialOffset ?? 0);
      if (offset > max) max = offset;
    }
    return max || 3.0; // Default 3.0 if no variation
  }, [config.sources]);

  // Calculate max vertical oscillation from sources
  const maxVerticalHeight = useMemo(() => {
    let max = 0;
    for (const source of config.sources) {
      const osc = source.orbit?.verticalOscillation;
      if (osc?.enabled && osc.amplitude > max) {
        max = osc.amplitude;
      }
    }
    return max || 3.0; // Default 3.0 if no oscillation
  }, [config.sources]);

  const radialThickness = maxRadialOffset * 2;
  const verticalHeight = maxVerticalHeight;

  const props = {
    center: config.orbit.center,
    radius: config.orbit.radius,
    radialThickness,
    verticalHeight,
    color,
    opacity,
    visible
  };

  switch (visualMode) {
    case 'solid':
      return <OrbitZoneDonut {...props} />;
    case 'wireframe':
      return <OrbitZoneWireframe {...props} />;
    case 'rings':
      return <OrbitZoneRings {...props} />;
    default:
      return <OrbitZoneDonut {...props} />;
  }
}
