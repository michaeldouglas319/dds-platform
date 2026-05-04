'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbitingParticlesProps {
  count?: number;
  radius?: number;
  speed?: number;
  particleSize?: number;
  color?: string;
}

export function OrbitingParticles({
  count = 8,
  radius = 1.5,
  speed = 1,
  particleSize = 0.08,
  color = '#FF6B9D',
}: OrbitingParticlesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Mesh[]>([]);

  // Create particles on mount
  React.useEffect(() => {
    if (groupRef.current) {
      particlesRef.current.forEach((particle) => {
        groupRef.current?.remove(particle);
      });
      particlesRef.current = [];

      // Create orbiting particles
      for (let i = 0; i < count; i++) {
        const geometry = new THREE.IcosahedronGeometry(particleSize, 4);
        const material = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.6,
          metalness: 0.8,
          roughness: 0.2,
        });
        const mesh = new THREE.Mesh(geometry, material);

        // Position on orbit circle
        const angle = (i / count) * Math.PI * 2;
        const y = Math.sin(angle) * radius;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle * 0.5) * (radius * 0.3);

        mesh.position.set(x, y, z);
        mesh.castShadow = true;

        groupRef.current?.add(mesh);
        particlesRef.current.push(mesh);
      }
    }
  }, [count, radius, particleSize, color]);

  // Animate particles in orbit
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.001 * speed;
      groupRef.current.rotation.x += 0.0005 * speed;

      // Individual particle bobbing and rotation
      particlesRef.current.forEach((particle, i) => {
        const baseAngle = (i / count) * Math.PI * 2;
        const time = state.clock.elapsedTime * speed;

        // Bobbing animation
        const bobAmount = Math.sin(time + i) * 0.2;
        particle.position.y += bobAmount * 0.01;

        // Spin particles
        particle.rotation.x += 0.01;
        particle.rotation.y += 0.02;
        particle.rotation.z += 0.015;

        // Pulsing scale
        const pulse = Math.sin(time * 2 + i) * 0.5 + 0.5;
        particle.scale.setScalar(1 + pulse * 0.3);

        // Opacity pulse
        if (particle.material instanceof THREE.MeshStandardMaterial) {
          particle.material.emissiveIntensity = 0.3 + pulse * 0.6;
        }
      });
    }
  });

  return <group ref={groupRef} />;
}
