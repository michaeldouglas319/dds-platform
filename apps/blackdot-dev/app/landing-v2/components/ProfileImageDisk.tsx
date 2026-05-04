'use client'

import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface ProfileImageDiskProps {
  scale?: number;
  position?: [number, number, number];
  metalness?: number;
  roughness?: number;
  emissive?: number;
}

export function ProfileImageDisk({
  scale = 1.5,
  position = [0, 0, 0],
  metalness = 0.4,
  roughness = 0.3,
  emissive = 0.2,
}: ProfileImageDiskProps) {
  const texture = useTexture('/assets/michael_douglas_profile.png');

  return (
    <mesh position={position} scale={scale}>
      <circleGeometry args={[1, 32]} />
      <meshStandardMaterial
        map={texture}
        metalness={metalness}
        roughness={roughness}
        emissive={new THREE.Color(0xffffff)}
        emissiveIntensity={emissive}
      />
    </mesh>
  );
}
