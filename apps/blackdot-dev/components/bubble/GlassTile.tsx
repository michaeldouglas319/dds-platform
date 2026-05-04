'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';

interface GlassTileProps {
  position: [number, number, number];
  scale: [number, number];
  color?: string;
  opacity?: number;
  children?: React.ReactNode;
}

export function GlassTile({
  position,
  scale,
  color = '#ffffff',
  opacity = 0.15,
}: GlassTileProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <planeGeometry args={[scale[0], scale[1]]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        metalness={0.0}
        roughness={0.8}
        envMapIntensity={0.6}
        emissive={color}
        emissiveIntensity={0.12}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Frosted glass tile - more realistic glass properties
 */
export function FrostedGlassTile({
  position,
  scale,
  color = '#888888',
  opacity = 0.25,
}: GlassTileProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <planeGeometry args={[scale[0], scale[1]]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        metalness={0.0}
        roughness={0.85}
        envMapIntensity={0.5}
        emissive={color}
        emissiveIntensity={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
