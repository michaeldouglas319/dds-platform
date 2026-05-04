'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { HybridParticle, ParticleSourceConfig } from '../types/path-particle.types';
import { buildGateToOrbitPath, buildLandingPath } from '../utils/pathBuilder';
import { ParticleSource } from './ParticleSource';
import { HybridMotionManager } from './HybridMotionManager';
import { HybridParticleRenderer } from './HybridParticleRenderer';
import { initializeOrbitalParams } from '../utils/orbitalMechanics';

/**
 * Hybrid System Demo
 *
 * Demonstrates the new path-based hybrid particle system.
 * Creates multiple particle sources (gates) with realistic path-based takeoff/landing
 * and physics-based orbital motion.
 *
 * Usage: Add this to HomeV2Scene to see it in action alongside existing systems
 */
export function HybridSystemDemo() {
  const particlesRef = useRef<HybridParticle[]>([]);

  // Define particle sources (gates) with paths
  const particleSources = useMemo((): ParticleSourceConfig[] => {
    const gates = [
      {
        id: 'gate-alpha',
        position: new THREE.Vector3(-45, 0.1, -45),
        color: '#FF6B6B', // Red
        emissive: '#FF3333',
      },
      {
        id: 'gate-beta',
        position: new THREE.Vector3(-45, 0.1, 45),
        color: '#4ECDC4', // Teal
        emissive: '#2DB8AA',
      },
      {
        id: 'gate-gamma',
        position: new THREE.Vector3(45, 0.1, -45),
        color: '#FFE66D', // Yellow
        emissive: '#FFD700',
      },
    ];

    // Taxi waypoints
    const taxiWaypoints = [
      { id: 'taxi-1', position: [-30, 0.1, 0] as [number, number, number] },
      { id: 'taxi-2', position: [-15, 0.1, 0] as [number, number, number] },
    ];

    const runwayEnd: [number, number, number] = [0, 0.1, 0];
    const orbitCenter: [number, number, number] = [0, 50, 0];
    const orbitRadius = 60;
    const orbitAltitude = 50;

    return gates.map((gate) => {
      // Build takeoff path
      const takeoffPath = buildGateToOrbitPath(
        [gate.position.x, gate.position.y, gate.position.z],
        taxiWaypoints.map((wp) => ({ id: wp.id, position: wp.position })),
        runwayEnd,
        orbitCenter,
        orbitRadius,
        orbitAltitude,
        0.7
      );

      // Build landing path
      const landingPath = buildLandingPath(
        orbitCenter,
        orbitRadius,
        orbitAltitude,
        runwayEnd,
        [gate.position.x, gate.position.y, gate.position.z],
        taxiWaypoints.map((wp) => ({ id: wp.id, position: wp.position })),
        0.7
      );

      // Create orbital parameters for this gate
      const orbitalParams = initializeOrbitalParams(
        new THREE.Vector3(...orbitCenter),
        orbitRadius,
        orbitAltitude
      );

      return {
        id: gate.id,
        gateId: gate.id,
        position: gate.position,
        fleetId: `fleet-${gate.id}`,
        color: gate.color,
        emissive: gate.emissive,
        takeoffPath,
        landingPath,
        orbitalParams,
        spawnRate: 0.5, // 1 particle every 2 seconds
        spawnDelay: 0,
        maxParticles: 15,
        pathDuration: 5.0, // 5 seconds total for taxi + takeoff
        orbitDuration: 20, // 20 seconds in orbit before landing
      };
    });
  }, []);

  return (
    <group name="hybrid-system-demo">
      {/* Particle Sources - spawns particles independently */}
      {particleSources.map((config) => (
        <ParticleSource
          key={config.id}
          config={config}
          particlesRef={particlesRef}
        />
      ))}

      {/* Motion Manager - updates particle positions based on lifecycle */}
      <HybridMotionManager particlesRef={particlesRef} enabled={true} />

      {/* Renderer - renders particles to screen */}
      <HybridParticleRenderer particlesRef={particlesRef} particleRadius={1.5} />
    </group>
  );
}
