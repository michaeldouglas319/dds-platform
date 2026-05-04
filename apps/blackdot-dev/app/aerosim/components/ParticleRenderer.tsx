'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  mass: number;
  charge: number;
  color: THREE.Color;
}

interface ParticleRendererProps {
  particleCount?: number;
  isRunning?: boolean;
  gravityConstant?: number;
  chargeConstant?: number;
  nuclearConstant?: number;
  timeStep?: number;
  friction?: number;
  maxSpeed?: number;
}

export function ParticleRenderer({
  particleCount = 5000,
  isRunning = true,
  gravityConstant: _gravityConstant = 1.0,
  chargeConstant = 1.0,
  nuclearConstant: _nuclearConstant = 1.0,
  timeStep = 0.01,
  friction = 0.1,
  maxSpeed = 100,
}: ParticleRendererProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<Particle[]>([]);
  const positionsRef = useRef<Float32Array>(null);
  const colorsRef = useRef<Float32Array>(null);
  const velocitiesRef = useRef<Float32Array>(null);

  // Initialize arrays - create new arrays, useEffect will populate refs
  const posArray = useMemo(() => new Float32Array(particleCount * 3), [particleCount]);
  const colArray = useMemo(() => new Float32Array(particleCount * 3), [particleCount]);

  // Initialize particles
  useEffect(() => {
    const particles: Particle[] = [];
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    // Create particles in a random cloud
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 80;
      const y = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;

      const vx = (Math.random() - 0.5) * 5;
      const vy = (Math.random() - 0.5) * 5;
      const vz = (Math.random() - 0.5) * 5;

      const mass = Math.random() * 2 + 0.5;
      const charge = (Math.random() - 0.5) * 2;

      // Create color based on charge
      const hue = (charge + 1) / 2; // 0 to 1
      const color = new THREE.Color().setHSL(hue * 0.8, 1, 0.5);

      particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(vx, vy, vz),
        mass,
        charge,
        color,
      });

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      velocities[i * 3] = vx;
      velocities[i * 3 + 1] = vy;
      velocities[i * 3 + 2] = vz;
    }

    (particlesRef as any).current = particles;
    (positionsRef as any).current = positions;
    (colorsRef as any).current = colors;
    (velocitiesRef as any).current = velocities;

    // Update geometry
    if (pointsRef.current) {
      const geometry = pointsRef.current.geometry;
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
  }, [particleCount]);

  // Animation loop
  useFrame(() => {
    if (!isRunning || !pointsRef.current || !positionsRef.current) return;

    const particles = particlesRef.current;
    const positions = positionsRef.current;
    const _velocities = velocitiesRef.current;
    const _colors = colorsRef.current;

    // Simple particle physics
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      // Apply velocity
      particle.position.x += particle.velocity.x * timeStep;
      particle.position.y += particle.velocity.y * timeStep;
      particle.position.z += particle.velocity.z * timeStep;

      // Apply friction
      particle.velocity.multiplyScalar(1 - friction * timeStep);

      // Clamp velocity
      const speed = particle.velocity.length();
      if (speed > maxSpeed) {
        particle.velocity.normalize().multiplyScalar(maxSpeed);
      }

      // Boundary bounce
      const boundarySize = 50;
      if (Math.abs(particle.position.x) > boundarySize) {
        particle.position.x = Math.sign(particle.position.x) * boundarySize;
        particle.velocity.x *= -0.8; // Damping bounce
      }
      if (Math.abs(particle.position.y) > boundarySize) {
        particle.position.y = Math.sign(particle.position.y) * boundarySize;
        particle.velocity.y *= -0.8;
      }
      if (Math.abs(particle.position.z) > boundarySize) {
        particle.position.z = Math.sign(particle.position.z) * boundarySize;
        particle.velocity.z *= -0.8;
      }

      // Update buffer
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
    }

    // Apply forces between particles (simplified)
    const forceStrength = 0.001;
    for (let i = 0; i < Math.min(particles.length, 100); i++) {
      const p1 = particles[i];

      for (let j = i + 1; j < Math.min(particles.length, 100); j++) {
        const p2 = particles[j];

        const dx = p2.position.x - p1.position.x;
        const dy = p2.position.y - p1.position.y;
        const dz = p2.position.z - p1.position.z;

        const distSq = dx * dx + dy * dy + dz * dz;
        const dist = Math.sqrt(distSq) + 0.1; // Avoid division by zero

        // Coulomb force (charge-based repulsion)
        const coulombForce =
          (forceStrength * chargeConstant * p1.charge * p2.charge) / distSq;

        const fx = (coulombForce * dx) / dist;
        const fy = (coulombForce * dy) / dist;
        const fz = (coulombForce * dz) / dist;

        // Apply force
        p1.velocity.x -= fx / p1.mass;
        p1.velocity.y -= fy / p1.mass;
        p1.velocity.z -= fz / p1.mass;

        p2.velocity.x += fx / p2.mass;
        p2.velocity.y += fy / p2.mass;
        p2.velocity.z += fz / p2.mass;
      }
    }

    // Update position attribute
    const geometry = pointsRef.current.geometry;
    const posAttr = geometry.getAttribute('position');
    if (posAttr) {
      (posAttr as THREE.BufferAttribute).needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[posArray, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colArray, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2.0}
        vertexColors
        sizeAttenuation={true}
        transparent
        opacity={0.9}
        toneMapped={false}
      />
    </points>
  );
}
