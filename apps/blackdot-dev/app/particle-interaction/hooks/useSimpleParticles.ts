'use client';

import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';

const MAX_PARTICLES = 10000;
const SPAWN_RATE = 50; // particles per frame

export function useSimpleParticles() {
  const { scene } = useThree();

  const stateRef = useRef({
    positions: new Float32Array(MAX_PARTICLES * 3),
    velocities: new Float32Array(MAX_PARTICLES * 3),
    alive: new Uint8Array(MAX_PARTICLES),
    count: 0,
    geometry: null as THREE.BufferGeometry | null,
    material: null as THREE.PointsMaterial | null,
    mesh: null as THREE.Points | null,
  });

  // Initialize on client only (fixes hydration error)
  useEffect(() => {
    const state = stateRef.current;

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(state.positions, 3));

    // Create material
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    // Create mesh
    const mesh = new THREE.Points(geometry, material);
    mesh.frustumCulled = false;

    state.geometry = geometry;
    state.material = material;
    state.mesh = mesh;

    scene.add(mesh);

    return () => {
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
    };
  }, [scene]);

  // Update particles each frame
  useFrame(() => {
    const state = stateRef.current;
    const gravity = 0.5;

    // Spawn new particles continuously
    for (let s = 0; s < SPAWN_RATE; s++) {
      const i = (state.count + s) % MAX_PARTICLES;
      const i3 = i * 3;

      // Random position at top
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 150;

      state.positions[i3] = Math.cos(angle) * radius;
      state.positions[i3 + 1] = 300;
      state.positions[i3 + 2] = Math.sin(angle) * radius;

      // Random downward velocity
      state.velocities[i3] = (Math.random() - 0.5) * 1;
      state.velocities[i3 + 1] = -8 - Math.random() * 2;
      state.velocities[i3 + 2] = (Math.random() - 0.5) * 1;

      state.alive[i] = 1;
    }
    state.count += SPAWN_RATE;

    // Update existing particles
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (state.alive[i] === 0) continue;

      const i3 = i * 3;

      // Apply gravity
      state.velocities[i3 + 1] -= gravity;

      // Update position
      state.positions[i3] += state.velocities[i3] * 0.1;
      state.positions[i3 + 1] += state.velocities[i3 + 1] * 0.1;
      state.positions[i3 + 2] += state.velocities[i3 + 2] * 0.1;

      // Deactivate if too low
      if (state.positions[i3 + 1] < -100) {
        state.alive[i] = 0;
      }
    }

    if (state.geometry) {
      state.geometry.attributes.position.needsUpdate = true;
    }
  });

  return stateRef.current;
}
