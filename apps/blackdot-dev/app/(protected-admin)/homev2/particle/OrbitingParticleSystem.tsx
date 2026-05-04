/**
 * Reusable orbiting particle system adapted from landing page
 * Creates fast-moving, shader-based particles that orbit around a center position
 *
 * This is the GPU-accelerated background particle system that complements
 * the runway-based multi-fleet particle system in HomeV2.
 */

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ORBITING_PARTICLE_CONFIG } from '../config/orbiting-particles.config';
import '../shaders/OrbitingParticleMaterial';

// Mobile detection and optimization
const isMobile = (typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) ||
  (typeof window !== 'undefined' && window.innerWidth < 768);
const isLowEnd = isMobile && (typeof navigator !== 'undefined' && navigator.hardwareConcurrency || 2) < 4;

const MOBILE_PARTICLE_REDUCTION = isLowEnd ? 0.3 : 0.5;
const UPDATE_THROTTLE = isMobile ? 2 : 1;

interface OrbitingParticleSystemProps {
  count?: number;
  centerPosition?: [number, number, number];
  avoidanceRadius?: number;
  avoidanceStrength?: number;
  orbitalSpeed?: number;
  color1?: string;
  color2?: string;
  visible?: boolean;
  shellRadiusScale?: number; // Added for dynamic scaling
}

/**
 * Fast-orbiting particle system for visual depth and motion
 *
 * @example
 * <OrbitingParticleSystem
 *   centerPosition={[0, 0, 0]}
 *   count={150}
 *   color1="#00BFFF"
 *   color2="#FF6347"
 * />
 */
export function OrbitingParticleSystem({
  count = ORBITING_PARTICLE_CONFIG.count,
  centerPosition = ORBITING_PARTICLE_CONFIG.centerPosition,
  avoidanceRadius = ORBITING_PARTICLE_CONFIG.avoidanceRadius,
  avoidanceStrength = ORBITING_PARTICLE_CONFIG.avoidanceStrength,
  orbitalSpeed = ORBITING_PARTICLE_CONFIG.orbitalSpeed,
  color1 = ORBITING_PARTICLE_CONFIG.color1,
  color2 = ORBITING_PARTICLE_CONFIG.color2,
  visible = true,
  shellRadiusScale = ORBITING_PARTICLE_CONFIG.shellRadiusScale,
}: OrbitingParticleSystemProps) {
  // Optimize particle count for mobile
  const optimizedCount = useMemo(() => {
    const baseCount = count;
    if (isMobile) {
      return Math.floor(baseCount * MOBILE_PARTICLE_REDUCTION);
    }
    return baseCount;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const frameCountRef = useRef(0);

  const positionsArrayRef = useRef<Float32Array | null>(null);
  const colorsArrayRef = useRef<Float32Array | null>(null);
  const scalesArrayRef = useRef<Float32Array | null>(null);

  // Initialize particle attributes
  useEffect(() => {
    const positions = new Float32Array(optimizedCount * 3);
    const colors = new Float32Array(optimizedCount * 3);
    const scales = new Float32Array(optimizedCount);

    const objectPos = new THREE.Vector3(...centerPosition);

    // SCALED SHELL SYSTEM: Create 200-unit diameter sphere
    const shellCount = 2;
    const innerShellWeight = 0.6;
    const effectiveShellRadiusScale = shellRadiusScale || 60; // Use prop or default

    for (let i = 0; i < optimizedCount; i++) {
      // Determine which shell
      let shell;
      const rand = Math.random();
      if (rand < innerShellWeight) {
        shell = Math.floor(Math.random() * 2);
      } else {
        shell = 2 + Math.floor(Math.random() * 2);
      }

      // Calculate radius based on shell - SCALED RELATIVE TO SCENE
      // Scene: Runway 100x100 units
      // At scale 100: inner shells ~50-100 units, outer shells ~100-150 units
      // This creates a ~300-unit diameter sphere (3x runway size)
      const shellProgress = Math.random();
      let radius: number;
      // Scale factor: scale of 100 = 1x base size
      const scaleFactor = effectiveShellRadiusScale / 100;
      
      if (shell < 2) {
        // Inner shells: base 50-100 units (0.5x to 1x runway size)
        radius = (50 + shell * 25 + Math.random() * 25) * scaleFactor;
      } else {
        // Outer shells: base 100-150 units (1x to 1.5x runway size)
        radius = (100 + (shell - 2) * 25 + Math.random() * 25) * scaleFactor;
      }

      // Spherical coordinates - LARGER SPHERE
      const theta = shellProgress * Math.PI * 2 + (shell * Math.PI / shellCount);
      const phi = Math.acos(Math.random() * 2 - 1);
      // Height variation scaled proportionally
      const height = (-20 + shellProgress * 40 + Math.random() * 15) * scaleFactor;

      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        height,
        radius * Math.sin(phi) * Math.sin(theta)
      ).add(objectPos);

      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      // Color gradient
      const color = new THREE.Color().lerpColors(
        new THREE.Color(color1),
        new THREE.Color(color2),
        Math.random()
      );

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      scales[i] = 1.0;
    }

    positionsArrayRef.current = positions;
    colorsArrayRef.current = colors;
    scalesArrayRef.current = scales;

    if (pointsRef.current) {
      const geometry = pointsRef.current.geometry;
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    }
  }, [optimizedCount, centerPosition, color1, color2, shellRadiusScale]);

  // Generate orbital parameters
  const { radii, speeds, angles, heights, noiseOffsets, phases } = useMemo(() => {
    const radii = new Float32Array(optimizedCount);
    const speeds = new Float32Array(optimizedCount);
    const angles = new Float32Array(optimizedCount);
    const heights = new Float32Array(optimizedCount);
    const noiseOffsets = new Float32Array(optimizedCount);
    const phases = new Float32Array(optimizedCount);

    for (let i = 0; i < optimizedCount; i++) {
      radii[i] = 0.5 + Math.random() * 0.3;
      speeds[i] = 0.2 + Math.random() * 0.3;
      angles[i] = Math.random() * Math.PI * 2;
      heights[i] = -0.2 + Math.random() * 0.4;
      noiseOffsets[i] = Math.random() * Math.PI * 1.1;
      phases[i] = Math.random() * Math.PI * 1.1;
    }

    return { radii, speeds, angles, heights, noiseOffsets, phases };
  }, [optimizedCount]);

  // Update shader uniforms
  useEffect(() => {
    if (materialRef.current) {
      const windowDPR = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
      const pixelRatio = isMobile ? Math.min(windowDPR, 1.5) : Math.min(windowDPR, 2);

      materialRef.current.uniforms.uPixelRatio.value = pixelRatio;
      materialRef.current.uniforms.uObjectPosition.value.set(...centerPosition);
      materialRef.current.uniforms.uAvoidanceRadius.value = avoidanceRadius;
      materialRef.current.uniforms.uAvoidanceStrength.value = avoidanceStrength;
      materialRef.current.uniforms.uOrbitalSpeed.value = orbitalSpeed;

      // Colors
      const c1 = new THREE.Color(color1);
      const c2 = new THREE.Color(color2);
      materialRef.current.uniforms.uColor1.value.set(c1.r, c1.g, c1.b);
      materialRef.current.uniforms.uColor2.value.set(c2.r, c2.g, c2.b);
    }
  }, [centerPosition, avoidanceRadius, avoidanceStrength, orbitalSpeed, color1, color2]);

  // Animation loop
  useFrame((state, delta) => {
    frameCountRef.current++;

    // Throttle updates on mobile
    if (isMobile && frameCountRef.current % UPDATE_THROTTLE !== 0) {
      return;
    }

    const t = state.clock.getElapsedTime();

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
    }

    // Update geometry
    if (pointsRef.current && positionsArrayRef.current) {
      const geometry = pointsRef.current.geometry;
      const posAttr = geometry.getAttribute('position');

      if (posAttr) {
        (posAttr as THREE.BufferAttribute).array = positionsArrayRef.current;
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group visible={visible}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positionsArrayRef.current || new Float32Array(optimizedCount * 3), 3]} />
          <bufferAttribute attach="attributes-color" args={[colorsArrayRef.current || new Float32Array(optimizedCount * 3), 3]} />
          <bufferAttribute attach="attributes-scale" args={[scalesArrayRef.current || new Float32Array(optimizedCount), 1]} />
          <bufferAttribute attach="attributes-aRadius" args={[radii, 1]} />
          <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
          <bufferAttribute attach="attributes-aAngle" args={[angles, 1]} />
          <bufferAttribute attach="attributes-aHeight" args={[heights, 1]} />
          <bufferAttribute attach="attributes-aNoiseOffset" args={[noiseOffsets, 1]} />
          <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        </bufferGeometry>
        <orbitingParticleMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
