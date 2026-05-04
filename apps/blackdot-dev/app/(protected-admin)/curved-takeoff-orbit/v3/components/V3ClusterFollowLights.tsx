/**
 * V3 Cluster Follow Lights
 *
 * 2-3 main PointLights that track particle cluster centers.
 * Provides scene illumination without per-particle lights.
 *
 * Performance: 97% reduction in PointLights (65 → 3)
 */

'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { V3Config } from '../config/v3.config';
import type { V3ParticlesState } from '../hooks/useV3Particles';

interface V3ClusterFollowLightsProps {
  config: V3Config;
  particlesState: V3ParticlesState;
}

export function V3ClusterFollowLights({ config, particlesState }: V3ClusterFollowLightsProps) {
  const lightsRef = useRef<THREE.PointLight[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const lightsEnabledRef = useRef(false);

  // Get config (with safe defaults)
  const lightCount = config.display.hybridGlow?.mainLightCount || 3;
  const lightPower = config.display.hybridGlow?.mainLightPower || 2000;
  const lightDistance = config.display.hybridGlow?.mainLightDistance || 150;

  // Initialize lights
  useEffect(() => {
    if (!groupRef.current) return;

    // Clear existing
    lightsRef.current.forEach(light => light.removeFromParent());
    lightsRef.current = [];

    // Create main lights
    for (let i = 0; i < lightCount; i++) {
      const light = new THREE.PointLight(0x000000, 1, lightDistance);
      light.power = lightPower;
      groupRef.current.add(light);
      lightsRef.current.push(light);
    }
  }, [lightCount, lightPower, lightDistance]);

  // Update light positions to follow particle clusters
  useFrame(() => {
    const particles = particlesState.particles.filter(p => p.scale > 0);
    if (particles.length === 0) return;

    // K-means-like clustering: divide particles into N groups
    const clusterSize = Math.ceil(particles.length / lightCount);
    
    for (let i = 0; i < lightsRef.current.length; i++) {
      const light = lightsRef.current[i];
      const startIdx = i * clusterSize;
      const endIdx = Math.min(startIdx + clusterSize, particles.length);
      const cluster = particles.slice(startIdx, endIdx);

      if (cluster.length === 0) continue;

      // Calculate cluster center
      const center = new THREE.Vector3();
      cluster.forEach(p => center.add(p.position));
      center.divideScalar(cluster.length);

      // Smoothly move light to cluster center
      light.position.lerp(center, 0.1);

      // Average color of cluster
      let avgR = 0, avgG = 0, avgB = 0;
      cluster.forEach(p => {
        const c = new THREE.Color(p.color);
        avgR += c.r;
        avgG += c.g;
        avgB += c.b;
      });
      avgR /= cluster.length;
      avgG /= cluster.length;
      avgB /= cluster.length;
      light.color.setRGB(avgR, avgG, avgB);
    }
  });

  return <group ref={groupRef} />;
}
