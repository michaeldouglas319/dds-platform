'use client';

/**
 * ParticleMorphBridge Component
 *
 * Emits particles in different patterns based on section layout type
 * Triggered when transitioning between sections
 */

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Points } from 'three';

interface ParticleMorphBridgeProps {
  isActive: boolean;
  layoutType: 'scroll-based' | 'grid' | 'carousel' | 'timeline' | 'gallery';
  position?: [number, number, number];
  color?: string;
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export function ParticleMorphBridge({
  isActive,
  layoutType,
  position = [0, 0, 0],
  color = '#3b82f6',
}: ParticleMorphBridgeProps) {
  const pointsRef = useRef<Points>(null);
  const particlesRef = useRef<Particle[]>([]);
  const { camera } = useThree();

  // Generate particles in different patterns based on layout type
  const generateParticles = (layoutType: string) => {
    const particles: Particle[] = [];
    const particleCount = 150;
    const startPos = new THREE.Vector3(...position);

    switch (layoutType) {
      case 'grid': {
        // Emit particles in a cone pattern (expanding grid)
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          const radius = 0.5;
          const x = Math.cos(angle) * radius;
          const y = (Math.random() - 0.5) * 2;
          const z = Math.sin(angle) * radius;

          particles.push({
            position: startPos.clone().add(new THREE.Vector3(x * 0.1, y * 0.1, z * 0.1)),
            velocity: new THREE.Vector3(x * 0.08, y * 0.08, z * 0.08),
            life: 1,
            maxLife: 2,
          });
        }
        break;
      }

      case 'carousel': {
        // Emit particles in an arc pattern
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI;
          const radius = 1;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * 0.5;
          const z = (Math.random() - 0.5) * 0.5;

          particles.push({
            position: startPos.clone(),
            velocity: new THREE.Vector3(x * 0.06, y * 0.06, z * 0.05),
            life: 1,
            maxLife: 2,
          });
        }
        break;
      }

      case 'timeline': {
        // Emit particles in a vertical line
        for (let i = 0; i < particleCount; i++) {
          const y = (i / particleCount) * 2 - 1;
          const x = (Math.random() - 0.5) * 0.3;
          const z = (Math.random() - 0.5) * 0.3;

          particles.push({
            position: startPos.clone(),
            velocity: new THREE.Vector3(x * 0.04, y * 0.1, z * 0.04),
            life: 1,
            maxLife: 2,
          });
        }
        break;
      }

      case 'gallery': {
        // Emit particles as a grid cloud
        const gridSize = Math.ceil(Math.sqrt(particleCount));
        for (let i = 0; i < particleCount; i++) {
          const ix = i % gridSize;
          const iy = Math.floor(i / gridSize);
          const x = (ix / gridSize - 0.5) * 1.5;
          const y = (iy / gridSize - 0.5) * 1.5;
          const z = (Math.random() - 0.5) * 0.5;

          particles.push({
            position: startPos.clone().add(new THREE.Vector3(x * 0.1, y * 0.1, z * 0.1)),
            velocity: new THREE.Vector3(x * 0.05, y * 0.05, z * 0.06),
            life: 1,
            maxLife: 2,
          });
        }
        break;
      }

      case 'scroll-based':
      default: {
        // Emit particles in a dispersing cloud
        for (let i = 0; i < particleCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const radius = 0.3;

          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.sin(phi) * Math.sin(theta);
          const z = radius * Math.cos(phi);

          particles.push({
            position: startPos.clone().add(new THREE.Vector3(x * 0.2, y * 0.2, z * 0.2)),
            velocity: new THREE.Vector3(x * 0.1, y * 0.1, z * 0.1),
            life: 1,
            maxLife: 2,
          });
        }
        break;
      }
    }

    return particles;
  };

  // Initialize particles when activated or layout changes
  useEffect(() => {
    if (isActive) {
      particlesRef.current = generateParticles(layoutType);
    }
  }, [isActive, layoutType]);

  // Update particles each frame
  useFrame(() => {
    const particles = particlesRef.current;

    if (!particles.length || !pointsRef.current) return;

    const positions = new Float32Array(particles.length * 3);
    const colors = new Float32Array(particles.length * 3);

    // Parse color
    const colorObj = new THREE.Color(color);

    particles.forEach((particle, i) => {
      // Apply gravity and damping
      particle.velocity.y -= 0.02; // gravity
      particle.velocity.multiplyScalar(0.98); // damping

      // Update position
      particle.position.add(particle.velocity);

      // Fade out
      particle.life -= 1 / 60; // Assuming 60fps

      // Set position
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;

      // Set color with alpha fading
      const alpha = Math.max(0, particle.life / particle.maxLife);
      colors[i * 3] = colorObj.r * alpha;
      colors[i * 3 + 1] = colorObj.g * alpha;
      colors[i * 3 + 2] = colorObj.b * alpha;
    });

    // Remove dead particles
    particlesRef.current = particles.filter((p) => p.life > 0);

    if (pointsRef.current.geometry) {
      pointsRef.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
      pointsRef.current.geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
      );
    }
  });

  if (!isActive || particlesRef.current.length === 0) {
    return null;
  }

  const positions = new Float32Array(particlesRef.current.length * 3);
  const colors = new Float32Array(particlesRef.current.length * 3);
  const colorObj = new THREE.Color(color);

  particlesRef.current.forEach((particle, i) => {
    positions[i * 3] = particle.position.x;
    positions[i * 3 + 1] = particle.position.y;
    positions[i * 3 + 2] = particle.position.z;

    const alpha = Math.max(0, particle.life / particle.maxLife);
    colors[i * 3] = colorObj.r;
    colors[i * 3 + 1] = colorObj.g;
    colors[i * 3 + 2] = colorObj.b;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
