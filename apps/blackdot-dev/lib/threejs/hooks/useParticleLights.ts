import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface UseParticleLightsProps {
  particles: Array<{ position: THREE.Vector3; color?: string | number | THREE.Color }>;
  lightSampling?: number;
  lightIntensity?: number;
  lightRadius?: number;
  enabled?: boolean;
}

/**
 * Hook that creates PointLights from particle positions.
 * Particles emit colored lights that illuminate clouds and each other.
 *
 * Usage:
 * const particleLights = useParticleLights({
 *   particles: particles.particles,
 *   lightSampling: 1,
 *   lightIntensity: 100,
 *   lightRadius: 50,
 * });
 */
export function useParticleLights(props: UseParticleLightsProps) {
  const {
    particles,
    lightSampling = 1,
    lightIntensity = 50,
    lightRadius = 50,
    enabled = true,
  } = props;

  const { scene } = useThree();
  const lightsRef = useRef<THREE.PointLight[]>([]);
  const colorLogFrameRef = useRef(0);

  useEffect(() => {
    console.log('[useParticleLights] Mounted', {
      particleCount: particles.length,
      lightSampling,
      lightIntensity,
      lightRadius,
      enabled,
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      lightsRef.current.forEach((light) => scene.remove(light));
      lightsRef.current = [];
      return;
    }

    const lightCount = Math.max(1, Math.ceil(particles.length / lightSampling));

    while (lightsRef.current.length > lightCount) {
      const light = lightsRef.current.pop();
      if (light) scene.remove(light);
    }

    while (lightsRef.current.length < lightCount) {
      const light = new THREE.PointLight(0xffffff, lightIntensity, lightRadius);
      scene.add(light);
      lightsRef.current.push(light);
    }

    if (particles.length > 0) {
      console.log('[useParticleLights] Created/updated', {
        particleCount: particles.length,
        lightCount: lightsRef.current.length,
      });
    }

    return () => {
      lightsRef.current.forEach((light) => scene.remove(light));
      lightsRef.current = [];
    };
  }, [scene, particles.length, lightSampling, lightIntensity, lightRadius, enabled]);

  useFrame(() => {
    if (!enabled || lightsRef.current.length === 0) return;

    lightsRef.current.forEach((light, lightIndex) => {
      const particleIndex = lightIndex * lightSampling;
      const particle = particles[particleIndex];

      if (particle) {
        light.position.copy(particle.position);

        if (particle.color) {
          if (particle.color instanceof THREE.Color) {
            light.color.copy(particle.color);
          } else if (typeof particle.color === 'string') {
            light.color.setStyle(particle.color);
          } else if (typeof particle.color === 'number') {
            light.color.setHex(particle.color);
          }

          if (colorLogFrameRef.current === 0 && lightIndex === 0) {
            const hexColor = particle.color instanceof THREE.Color
              ? `0x${particle.color.getHex().toString(16).padStart(6, '0')}`
              : particle.color;
            console.log('[useParticleLights] Sample light color:', {
              particle0Color: hexColor,
              light0Color: `0x${light.color.getHex().toString(16).padStart(6, '0')}`,
            });
          }
        }
      }
    });

    colorLogFrameRef.current = (colorLogFrameRef.current + 1) % 60;
  });

  return lightsRef.current;
}
