'use client';

import { useRef, useCallback, MutableRefObject, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PathEvaluator } from '@/lib/threejs/utils/pathSystem';
import type { HybridParticle, ParticleSourceConfig } from '../types/path-particle.types';

interface ParticleSourceProps {
  config: ParticleSourceConfig;
  particlesRef: MutableRefObject<HybridParticle[]>;
  onParticleSpawn?: (particle: HybridParticle) => void;
}

/**
 * Particle Source Component
 *
 * Independent particle emitter for a specific gate/origin.
 * Manages spawning, path initialization, and lifecycle tracking.
 */
export function ParticleSource({
  config,
  particlesRef,
  onParticleSpawn,
}: ParticleSourceProps) {
  const particleCountRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);
  const hasStartedRef = useRef(false);

  // Calculate spawn interval from spawn rate
  const spawnIntervalMs = useCallback(() => {
    return 1000 / Math.max(config.spawnRate, 0.01);
  }, [config.spawnRate]);

  // Create new particle
  const spawnParticle = useCallback(() => {
    // Check if we've hit the max particle limit
    const activeParticles = particlesRef.current.filter(
      (p) => p.sourceId === config.id && p.phase !== 'landed'
    );
    if (activeParticles.length >= config.maxParticles) {
      return;
    }

    const particle: HybridParticle = {
      // Identity
      id: particleCountRef.current++,
      sourceId: config.id,
      fleetId: config.fleetId,
      modelId: 1, // Default model type for orientation calculations

      // Lifecycle
      phase: 'taxi',
      phaseStartTime: performance.now() / 1000,

      // Paths
      takeoffPath: config.takeoffPath,
      landingPath: config.landingPath,
      pathEvaluator: new PathEvaluator(config.takeoffPath),
      pathProgress: 0,

      // Orbital
      orbitalParams: config.orbitalParams,
      orbitAngle: 0,
      orbitalSpeed: config.orbitalParams.speed || 0.6,

      // Position and motion
      position: new THREE.Vector3(...config.position),
      velocity: new THREE.Vector3(0, 0, 0),
      orientation: new THREE.Quaternion(),

      // Rendering
      scale: 1.0,
      color: config.color,
      emissive: config.emissive,
      visible: true,

      // Orbital variation
      radiusVariation: Math.random(),
      speedVariation: Math.random(),
      inclinationPhase: Math.random() * Math.PI * 2,

      // Lifecycle
      birthTime: performance.now() / 1000,
      maxLifetime: config.orbitDuration || 30,
    };

    // Add to particles array
    particlesRef.current.push(particle);

    // Notify callback
    onParticleSpawn?.(particle);

    console.log(
      `[ParticleSource] Spawned particle ${particle.id} from ${config.id}. Total: ${particlesRef.current.length}`
    );
  }, [config, particlesRef, onParticleSpawn]);

  // Main spawn loop
  useFrame((state) => {
    // Wait for initial delay
    if (!hasStartedRef.current) {
      if (state.clock.getElapsedTime() < config.spawnDelay) {
        return;
      }
      hasStartedRef.current = true;
    }

    // Check if it's time to spawn
    const now = performance.now();
    if (now - lastSpawnTimeRef.current >= spawnIntervalMs()) {
      spawnParticle();
      lastSpawnTimeRef.current = now;
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Remove particles from this source
      particlesRef.current = particlesRef.current.filter(
        (p) => p.sourceId !== config.id
      );
    };
  }, [config.id, particlesRef]);

  // This component doesn't render anything
  return null;
}
