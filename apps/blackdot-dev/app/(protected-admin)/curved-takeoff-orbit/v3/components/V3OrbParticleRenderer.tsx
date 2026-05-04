/**
 * V3 Orb Particle Renderer
 *
 * Glowing PointLight spheres that illuminate the scene.
 * Based on Three.js "Selective Lights" example pattern:
 * - Each particle = PointLight + Emissive Sphere Mesh
 * - Real-time illumination contribution
 * - Animated positions from particle physics state
 */

'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { V3Config } from '../config/v3.config';
import type { V3ParticlesState } from '../hooks/useV3Particles';

interface V3OrbParticleRendererProps {
  config: V3Config;
  particlesState: V3ParticlesState;
}

export function V3OrbParticleRenderer({ config, particlesState }: V3OrbParticleRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lightsRef = useRef<THREE.PointLight[]>([]);
  const meshesRef = useRef<THREE.Mesh[]>([]);

  // Orb settings from config (with safe defaults)
  const orbConfig = config.display.orb || {
    lightPower: 800,
    lightDistance: 100,
    sphereRadius: 0.3,
  };

  // Create reusable sphere geometry and material once
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.SphereGeometry(orbConfig.sphereRadius, 16, 8);
    const mat = new THREE.MeshStandardMaterial({
      emissive: 0x000000,
      emissiveIntensity: 1.0,
      toneMapped: false,  // Keep glow bright
      roughness: 0.2,     // Slight reflection from other lights
      metalness: 0.15,    // Subtle metallic sheen
    });
    return { geometry: geo, material: mat };
  }, [orbConfig.sphereRadius]);

  // Initialize lights and meshes on mount
  useEffect(() => {
    if (!groupRef.current) return;

    // Clear previous lights/meshes
    lightsRef.current.forEach((light) => light.removeFromParent());
    meshesRef.current.forEach((mesh) => mesh.removeFromParent());
    lightsRef.current = [];
    meshesRef.current = [];

    // Create lights and meshes for each particle
    for (let i = 0; i < config.particleCount; i++) {
      // Create PointLight
      const light = new THREE.PointLight(
        0xffffff,  // Color (will be updated per frame)
        0,         // Start with intensity 0 to avoid center spotlight
        orbConfig.lightDistance
      );
      light.power = orbConfig.lightPower;
      light.position.set(0, 0, 0);  // Will be updated per frame

      // Create emissive sphere mesh and attach to light
      const mesh = new THREE.Mesh(geometry, material.clone());
      mesh.scale.set(1, 1, 1);
      mesh.visible = false;  // Start invisible
      light.add(mesh);

      groupRef.current.add(light);
      lightsRef.current.push(light);
      meshesRef.current.push(mesh);
    }
  }, [config.particleCount, geometry, material, orbConfig.lightDistance, orbConfig.lightPower]);

  // Update light positions, colors, and intensities every frame
  useFrame(() => {
    const particles = particlesState.particles;

    for (let i = 0; i < lightsRef.current.length; i++) {
      const light = lightsRef.current[i];
      const mesh = meshesRef.current[i];
      const particle = particles[i];

      if (particle && particle.scale > 0) {
        // Update position
        light.position.copy(particle.position);

        // Update color from particle color
        light.color.copy(particle.color);
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (material.emissive) {
          material.emissive.copy(particle.color);
        }

        // Scale intensity based on particle scale/visibility
        // Only enable light when particle is visible
        light.intensity = particle.scale * 0.8;  // 0-0.8 range

        // Show mesh
        mesh.visible = true;
      } else {
        // Hide invisible particles and disable their lights
        light.intensity = 0;  // Disable light contribution
        mesh.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Lights are created and managed in useEffect and useFrame above */}
    </group>
  );
}
