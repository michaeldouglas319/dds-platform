'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DebugLightingSphereProps {
  position?: [number, number, number];
  size?: number;
  particles?: Array<{ position: THREE.Vector3; color?: string | number }>;
  lights?: THREE.Light[];
}

/**
 * Debug sphere that:
 * 1. Gets colored from first particle's color (verify color inheritance)
 * 2. Responds to lights normally (verify light emission)
 * 3. Shows us if the lighting system is working at all
 */
export function DebugLightingSphere(props: DebugLightingSphereProps) {
  const {
    position = [0, 5, 0],
    size = 1,
    particles = [],
    lights = [],
  } = props;

  const { scene } = useThree();
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const initializedRef = useRef(false);

  // Log initial state
  useEffect(() => {
    console.log('[DebugLightingSphere] Mounted', {
      particleCount: particles.length,
      lightCount: lights.length,
    });
  }, []);

  useEffect(() => {
    if (particles.length === 0) {
      if (!initializedRef.current) {
        console.log('[DebugLightingSphere] Waiting for particles...', {
          particleCount: particles.length,
        });
      }
      return;
    }

    // Mark as initialized
    if (!initializedRef.current) {
      initializedRef.current = true;
    }

    // Get first particle's color
    const firstParticle = particles[0];
    let colorValue: number = 0xffffff; // default white

    if (firstParticle.color) {
      if (typeof firstParticle.color === 'string') {
        try {
          colorValue = new THREE.Color(firstParticle.color).getHex();
          console.log(
            `DebugLightingSphere: Particle color '${firstParticle.color}' → 0x${colorValue.toString(16)}`
          );
        } catch (e) {
          console.error(`Failed to parse color '${firstParticle.color}':`, e);
        }
      } else {
        colorValue = firstParticle.color;
        console.log(
          `DebugLightingSphere: Particle color 0x${colorValue.toString(16)}`
        );
      }
    }

    // Create sphere
    const geometry = new THREE.SphereGeometry(size, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: colorValue,
      emissive: 0x000000,
      shininess: 100,
      wireframe: false,
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(...position);
    sphereRef.current = sphere;
    scene.add(sphere);

    // Log light setup
    console.log(
      `DebugLightingSphere: Created with ${lights.length} lights`,
      lights.map((l) => ({
        type: l.constructor.name,
        color: l instanceof THREE.PointLight ? `0x${(l as THREE.PointLight).color.getHex().toString(16)}` : 'N/A',
        intensity: (l as any).intensity,
      }))
    );

    return () => {
      scene.remove(sphere);
      geometry.dispose();
      material.dispose();
    };
  }, [scene, particles, lights, position, size]);

  // Debug info in console
  useFrame(() => {
    if (sphereRef.current) {
      const material = sphereRef.current.material as THREE.MeshPhongMaterial;
      // Just verify it exists and is being rendered
      if (!material) {
        console.warn('Material lost!');
      }
    }
  });

  return null;
}
