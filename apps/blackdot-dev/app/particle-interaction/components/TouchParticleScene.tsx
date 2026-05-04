'use client';

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { useMemo, useRef, useCallback } from 'react';
import { useFBOParticles, useVirtualHand } from '../hooks/index';
import {
  particleVertShader,
  particleFragShader,
} from '../shaders/index';
import { HandMesh } from './HandMesh';

interface TouchParticleSceneProps {
  particleCount: number;
  handBounceRatio: number;
  handForce: number;
  gravity: number;
  onStats?: (stats: { fps: number; particles: number }) => void;
}

export function TouchParticleScene({
  particleCount,
  handBounceRatio,
  handForce,
  gravity,
  onStats,
}: TouchParticleSceneProps) {
  const { scene } = useThree();

  // Initialize particle system
  const fboParticles = useFBOParticles(particleCount, {
    dropRadius: 150,
    fromY: 200,
    yDynamicRange: 50,
  });

  // Initialize virtual hand tracking
  const hand = useVirtualHand();

  // Create particle material
  const particleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: particleVertShader,
      fragmentShader: particleFragShader,
      uniforms: {
        texturePosition: { value: fboParticles.positionTexture },
        pointSize: { value: 6.0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  }, [fboParticles.positionTexture]);

  // Store state for per-frame updates
  const stateRef = useRef({
    frameCount: 0,
    startTime: Date.now(),
  });

  // Per-frame update: compute particles and update physics parameters
  useFrame((state) => {
    const deltaTime = state.clock.getDelta();
    stateRef.current.frameCount++;

    // Update physics uniforms
    fboParticles.velocityMaterial.uniforms.handBounceRatio.value = handBounceRatio;
    fboParticles.velocityMaterial.uniforms.handForce.value = handForce;
    fboParticles.velocityMaterial.uniforms.gravity.value = gravity;
    fboParticles.velocityMaterial.uniforms.palmVelocity.value =
      hand.palmVelocity;

    // Run compute passes
    fboParticles.compute(hand.handMatrices, deltaTime);

    // Update particle texture reference
    particleMaterial.uniforms.texturePosition.value = fboParticles.positionTexture;

    // Debug first frame
    if (stateRef.current.frameCount === 1) {
      console.log('Frame 1:', {
        particleCount,
        textureSize: Math.sqrt(((fboParticles.positionTexture.image as Record<string, unknown>)?.width as number) ?? 0),
        hasGeometry: !!fboParticles.particleGeometry,
        geomAttributes: Object.keys(fboParticles.particleGeometry.attributes),
      });
    }

    // Emit stats every 30 frames
    if (onStats && stateRef.current.frameCount % 30 === 0) {
      const elapsed = (Date.now() - stateRef.current.startTime) / 1000;
      const fps = stateRef.current.frameCount / elapsed;
      onStats({ fps: Math.round(fps), particles: particleCount });
    }
  });

  // Create points mesh
  const pointsMesh = useMemo(() => {
    const mesh = new THREE.Points(fboParticles.particleGeometry, particleMaterial);
    mesh.frustumCulled = false;
    mesh.position.z = 0;
    return mesh;
  }, [particleMaterial]);

  // Simple test particle for debugging
  const testParticles = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    // Test particles at different heights to verify rendering
    const positions = new Float32Array([
      0, 50, 0,           // center
      0, 200, 0,          // high up
      100, 100, 0,        // right
      -100, 100, 0,       // left
      0, 100, 100,        // forward
      0, 100, -100,       // back
    ]);
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00ff00,
      size: 15,
      sizeAttenuation: true,
    });
    return new THREE.Points(geom, material);
  }, []);

  // Debug visualization of position texture
  const debugTextureMesh = useMemo(() => {
    const geom = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshBasicMaterial({
      map: fboParticles.positionTexture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geom, material);
    mesh.position.set(0, 150, -200);
    mesh.rotation.x = -0.3;
    return mesh;
  }, [fboParticles.positionTexture]);

  return (
    <>
      {/* Render particles */}
      <primitive object={pointsMesh} />

      {/* Debug test particles */}
      <primitive object={testParticles} />

      {/* Debug texture visualization */}
      <primitive object={debugTextureMesh} />

      {/* Hand mesh visualization */}
      <HandMesh
        handMatrices={hand.handMatrices}
        handPosition={hand.handPosition}
      />

      {/* Grid floor for reference */}
      <gridHelper args={[400, 40]} position={[0, -50, 0]} />

      {/* Axes helper at origin */}
      <axesHelper args={[100]} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[50, 100, 50]} intensity={1} />
    </>
  );
}
