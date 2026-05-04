/**
 * Curved Takeoff Orbit V3 - Gold Standard Implementation
 *
 * Integration of all V3 systems:
 * - Phase 1: Purple Waypoint Auto-Generation (waypointCalculator)
 * - Phase 2: Rapier Orbit Physics (orbitPhysics)
 * - Phase 3: Blue Gate Attraction (blueGatePhysics)
 * - Phase 4: Orbit Entry Acceptance (velocity matching)
 * - Phase 5: Momentum Transitions (smooth handoffs)
 * - Phase 6: Exit Eligibility (angle + time + proximity)
 *
 * Core Rules:
 * #1: Momentum-Based Flow (no instant snaps)
 * #2: Blue Gate Attraction (timed/state-based pulling)
 * #3: Orbit Entry Acceptance (smooth velocity matching)
 */

'use client';

import { useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { V3Config } from './config/v3.config';
import { useV3Trajectories } from './hooks/useV3Trajectories';
import { useV3BlueGates } from './hooks/useV3BlueGates';
import { useV3Physics } from './hooks/useV3Physics';
import { useV3Particles } from './hooks/useV3Particles';
import { V3ParticleRenderer } from './components/V3ParticleRenderer';
import { V3OrbParticleRenderer } from './components/V3OrbParticleRenderer';
import { V3SphereParticleRenderer } from './components/V3SphereParticleRenderer';
import { V3ClusterFollowLights } from './components/V3ClusterFollowLights';
import { V3DebugVisuals } from './components/V3DebugVisuals';
import { McLarenCircuit } from './components/McLarenCircuit';
import { V3SourceGateModels } from './components/V3SourceGateModels';
import { V3StaticObjectsRenderer } from './components/V3StaticObjectsRenderer';
// postprocessing disabled (R3F v8 compat) — re-enable when upgrading to R3F v9+React 19
const EffectComposer = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const Bloom = (_: Record<string, unknown>) => null

interface V3SceneProps {
  config: V3Config;
  scale?: number | [number, number, number];

  // Config override props
  baseParticlesOnly?: boolean;      // Force simple sphere rendering (no GLTF models)
  showStaticModels?: boolean;       // Override display.showStaticObjects
  showSourceModels?: boolean;       // Override display.showModels
  showGroundPlane?: boolean;        // Override ground plane visibility
}

function V3Scene({
  config,
  scale = .2,
  baseParticlesOnly,
  showStaticModels,
  showSourceModels,
  showGroundPlane = true,
}: V3SceneProps) {
  // Track pointer position for particle deflection
  const pointerPositionRef = useRef<THREE.Vector3 | null>(null);

  // Compute effective display values from props + config
  const effectiveParticleMode = baseParticlesOnly && (config.display.particleMode === 'model' || config.display.particleMode === 'orb')
    ? 'hybrid-glow'
    : config.display.particleMode;

  const effectiveShowModels = showSourceModels ?? config.display.showModels;
  const effectiveShowStaticObjects = showStaticModels ?? config.display.showStaticObjects;

  // Initialize all V3 systems
  const trajectories = useV3Trajectories(config);

  // Must call hooks unconditionally before early return
  const blueGates = useV3BlueGates(config, trajectories.trajectories);
  const physics = useV3Physics(config);
  const particles = useV3Particles(config, trajectories, blueGates, physics, pointerPositionRef);

  // Pointer event handlers for deflection (memoized with useCallback)
  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    pointerPositionRef.current = event.point.clone();
  }, []);

  const handlePointerLeave = useCallback(() => {
    pointerPositionRef.current = null;
  }, []);

  if (!trajectories.isReady) {
    return (
      <group scale={scale}>
        <mesh position={[0, 10, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="red" wireframe />
        </mesh>
      </group>
    );
  }

  // Check if McLaren circuit source exists
  const mclarenSource = config.sources.find(s => s.id === 'mclaren-circuit');
  const mclarenEnabled = mclarenSource && mclarenSource.flightPattern?.isGroundSource;

  return (
    <>
      <group scale={scale}>
        {/* Configurable debug visuals - respects config.debug toggles */}
        <V3DebugVisuals config={config} trajectories={trajectories} particles={particles} />

        {/* Invisible raycasting plane for pointer tracking */}
        <mesh
          position={[config.orbit.center.x, config.orbit.center.y, config.orbit.center.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <planeGeometry args={[config.orbit.radius * 4, config.orbit.radius * 4]} />
          <meshBasicMaterial visible={false} />
        </mesh>


        {/* Source gate models - use effective value */}
        {effectiveShowModels && (
          <V3SourceGateModels config={config} />
        )}

        {/* Static scene objects (buildings, decorations) - use effective value */}
        {effectiveShowStaticObjects && (
          <V3StaticObjectsRenderer config={config} />
        )}

        {/* Particle renderer - use effective particle mode */}
        {effectiveParticleMode === 'model' && (
          <V3ParticleRenderer config={config} particlesState={particles} />
        )}
        {effectiveParticleMode === 'orb' && (
          <V3OrbParticleRenderer config={config} particlesState={particles} />
        )}
        {effectiveParticleMode === 'sphere' && (
          <V3SphereParticleRenderer config={config} particlesState={particles} />
        )}
        {effectiveParticleMode === 'hybrid-glow' && (
          <>
            {/* Cluster follow lights for scene illumination */}
            <V3ClusterFollowLights config={config} particlesState={particles} />
            {/* Emissive spheres for particles */}
            <V3SphereParticleRenderer config={config} particlesState={particles} />
          </>
        )}
        {effectiveParticleMode === 'emissive-bloom' && (
          <>
            {/* Emissive spheres only (no lights) */}
            <V3SphereParticleRenderer config={config} particlesState={particles} />
          </>
        )}

        {/* McLaren Circuit - if enabled */}
        {mclarenEnabled && (
          <McLarenCircuit
            radius={70}
            vehicleCount={3}
            speed={0.3}
            groundLevel={1}
            enabled={true}
          />
        )}

        {/* Lighting */}
        <ambientLight intensity={config.display.lighting?.ambientIntensity ?? 0.15} />
        <directionalLight position={[10, 10, 5]} intensity={config.display.lighting?.directionalIntensity ?? 0.5} />

        {/* Ground plane */}
        {showGroundPlane && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        )}
      </group>

      {/* POST-PROCESSING - Bloom for glow modes */}
      {(effectiveParticleMode === 'hybrid-glow' || effectiveParticleMode === 'emissive-bloom') && (
        <EffectComposer>
          <Bloom
            luminanceThreshold={config.display.hybridGlow?.bloomThreshold ?? 0.9}
            luminanceSmoothing={0.9}
            intensity={config.display.hybridGlow?.bloomIntensity ?? 0.2}
            height={300}
            kernelSize={config.display.hybridGlow?.bloomKernelSize ?? 3}
            mipmapBlur={config.display.hybridGlow?.bloomMipmapBlur ?? true}
          />
        </EffectComposer>
      )}
    </>
  );
}

export function CurvedTakeoffOrbitV3({
  config,
  scale = 1,
  baseParticlesOnly,
  showStaticModels,
  showSourceModels,
  showGroundPlane,
}: V3SceneProps) {
  return (
    <V3Scene
      config={config}
      scale={scale}
      baseParticlesOnly={baseParticlesOnly}
      showStaticModels={showStaticModels}
      showSourceModels={showSourceModels}
      showGroundPlane={showGroundPlane}
    />
  );
}
