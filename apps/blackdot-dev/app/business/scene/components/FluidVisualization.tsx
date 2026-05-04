'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { FluidSolver } from '@/lib/threejs/physics/fluidSolver';
import type { FluidConfig } from '@/lib/threejs/physics/fluidConfig';
import { FluidParticleSystem } from '@/lib/threejs/visualization/fluidParticles';

interface FluidVisualizationProps {
  solver: FluidSolver | null;
  config: FluidConfig;
  modelBounds?: { center: THREE.Vector3; radius: number };
}

export function FluidVisualization({ solver, config, modelBounds }: FluidVisualizationProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleSystemRef = useRef<FluidParticleSystem | null>(null);
  const { gl } = useThree();

  // Initialize particle system
  useEffect(() => {
    if (!solver) return;

    const particleSystem = new FluidParticleSystem(config.particleCount);
    particleSystem.setSolver(solver);
    
    // Set model bounds for collision avoidance
    if (modelBounds) {
      particleSystem.setModelBounds(modelBounds.center, modelBounds.radius);
    }
    
    particleSystemRef.current = particleSystem;

    // Update geometry when particle system is initialized
    if (pointsRef.current) {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', particleSystem.getPositionAttribute());
      pointsRef.current.geometry = geom;
    }

    return () => {
      // Cleanup
      particleSystemRef.current = null;
    };
  }, [solver, config.particleCount]);

  // Update particle count when it changes
  useEffect(() => {
    if (particleSystemRef.current && pointsRef.current) {
      particleSystemRef.current.setParticleCount(config.particleCount);
      
      // Update model bounds if provided
      if (modelBounds) {
        particleSystemRef.current.setModelBounds(modelBounds.center, modelBounds.radius);
      }
      
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', particleSystemRef.current.getPositionAttribute());
      if (pointsRef.current.geometry) {
        pointsRef.current.geometry.dispose();
      }
      pointsRef.current.geometry = geom;
    }
  }, [config.particleCount, modelBounds]);

  // Update particles each frame
  useFrame((state, dt) => {
    if (!particleSystemRef.current || !pointsRef.current) return;

    // Update particles
    particleSystemRef.current.update(dt);

    // Update geometry positions
    const geometry = pointsRef.current.geometry as THREE.BufferGeometry;
    const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    if (positionAttribute) {
      const positions = particleSystemRef.current.getPositions();
      
      // Validate positions to prevent NaN
      for (let i = 0; i < positions.length; i++) {
        if (!isFinite(positions[i])) {
          positions[i] = 0; // Reset NaN/Infinity to 0
        }
      }
      
      // Update the attribute array
      for (let i = 0; i < positions.length; i++) {
        positionAttribute.array[i] = positions[i];
      }
      positionAttribute.needsUpdate = true;
      geometry.computeBoundingSphere(); // Recompute bounding sphere
    }
  });

  // Create material (geometry is created dynamically when particle system initializes)
  // Hooks must be called unconditionally before any early returns
  const material = useMemo(() => {
    // Best practices for particle visualization:
    // - Larger size for visibility (0.15 units)
    // - Bright cyan color (easy to see against dark background)
    // - Additive blending for particle accumulation effect
    // - Proper depth handling for layering
    return new THREE.PointsMaterial({
      size: 0.15,
      sizeAttenuation: true,
      color: new THREE.Color(0x00d4ff), // Bright cyan
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending, // Particles blend additively
      toneMapped: false, // Preserve bright colors
    });
  }, []);

  // Create initial geometry
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    // Initialize with empty positions (will be updated when particle system initializes)
    const positions = new Float32Array((config.particleCount || 10) * 3);
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [config.particleCount]);

  // Only render if visualization type is particles
  if (config.visualizationType === 'none') {
    return null;
  }

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}
