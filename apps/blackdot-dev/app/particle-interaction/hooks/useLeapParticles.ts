'use client';

import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { settings } from '../lib/leap/settings';
import { adaptHandData, type VirtualHandData } from '../lib/leap/handAdapter';
import * as particles from '../lib/leap/particles';

export interface UseLeapParticlesConfig {
  particleCount?: number;
  handBounceRatio?: number;
  handForce?: number;
  gravity?: number;
  particlesDropRadius?: number;
  particlesFromY?: number;
  particlesYDynamicRange?: number;
  useBillboardParticle?: boolean;
}

export interface UseLeapParticlesReturn {
  particleMesh: THREE.Mesh | THREE.Points | null;
}

export function useLeapParticles(
  hand: VirtualHandData,
  config?: UseLeapParticlesConfig
): UseLeapParticlesReturn {
  const { gl } = useThree();
  const handRef = useRef<VirtualHandData>(hand);
  const configRef = useRef<UseLeapParticlesConfig | undefined>(config);
  const [particleMesh, setParticleMesh] = useState<THREE.Mesh | THREE.Points | null>(null);
  
  // Store refs to cleanup
  const initializedRef = useRef(false);

  // Update references when they change
  useEffect(() => {
    handRef.current = hand;
  }, [hand]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Initialize particle system (only once, matching original pattern)
  useEffect(() => {
    if (!gl || initializedRef.current) return;

    try {
      // Calculate texture dimensions based on particle count
      if (config?.particleCount) {
        const count = config.particleCount;
        // Find appropriate texture size (power of 2)
        let size = 2;
        while (size * size < count) {
          size *= 2;
        }
        settings.simulatorTextureWidth = size;
        settings.simulatorTextureHeight = size;
      }

      // Set initial settings from config (direct mutation, matching original)
      settings.useBillboardParticle = config?.useBillboardParticle ?? false;
      settings.particlesDropRadius = config?.particlesDropRadius ?? 20;
      settings.particlesFromY = config?.particlesFromY ?? 300;
      settings.particlesYDynamicRange = config?.particlesYDynamicRange ?? 300;
      settings.handBounceRatio = config?.handBounceRatio ?? 0.1;
      settings.handForce = config?.handForce ?? 0.015;
      settings.gravity = config?.gravity ?? 10;
      settings.hands = 1;

      const adaptedHand = adaptHandData(handRef.current);
      console.log('Initializing particles with hand:', adaptedHand);

      // Initialize particles (which initializes FBO internally, matching original)
      const mesh = particles.init(gl, adaptedHand);
      initializedRef.current = true;

      console.log('Particles initialized, mesh:', mesh);

      // Access module-level mesh export (matching original pattern)
      setParticleMesh(mesh);
    } catch (error) {
      console.error('Failed to initialize particle system:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    }

    return () => {
      // Cleanup - don't set state here as it causes infinite loops
      initializedRef.current = false;
    };
  }, [gl]); // Only depend on gl to initialize once

  // Update loop (matching original pattern)
  useFrame((state, delta) => {
    if (!initializedRef.current || !particles.mesh) {
      return;
    }

    // Update settings directly (matching original pattern where settings are mutated)
    const currentConfig = configRef.current;
    if (currentConfig) {
      settings.handBounceRatio = currentConfig.handBounceRatio ?? 0.1;
      settings.handForce = currentConfig.handForce ?? 0.015;
      settings.gravity = currentConfig.gravity ?? 10;
      settings.particlesDropRadius = currentConfig.particlesDropRadius ?? 20;
      settings.particlesFromY = currentConfig.particlesFromY ?? 300;
      settings.particlesYDynamicRange = currentConfig.particlesYDynamicRange ?? 300;
    }

    // Update hand data
    const adaptedHand = adaptHandData(handRef.current);
    particles.updateHand(adaptedHand);

    // Update particles (reads from module-level settings, matching original)
    particles.update(delta);
  });

  // Return the state mesh, not the module-level one (to ensure React re-renders)
  return {
    particleMesh,
  };
}
