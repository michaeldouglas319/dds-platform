'use client'

import { useRef, useState } from 'react';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingButtonShapeProps {
  position: [number, number, number];
  color: string;
  shape: 'icosahedron' | 'octahedron' | 'tetrahedron' | 'box' | 'sphere' | 'torus';
  scale?: number;
  floatIntensity?: number;
  rotationIntensity?: number;
  speed?: number;
  onClick?: () => void;
  transmissionConfig?: {
    transmission?: number;
    thickness?: number;
    roughness?: number;
    ior?: number;
  };
  dockStyle?: boolean; // Enable Apple Dock-like hover behavior
}

export function FloatingButtonShape({
  position,
  color,
  shape,
  scale = 1,
  floatIntensity = 0.5,
  rotationIntensity = 0.5,
  speed = 2,
  onClick,
  transmissionConfig = {},
  dockStyle = true,
}: FloatingButtonShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  const defaultConfig = {
    transmission: 0.8,
    thickness: 100,
    roughness: 0.3,
    ior: 1.5,
  };

  const config = { ...defaultConfig, ...transmissionConfig };

  // Smooth hover animation and responsive position transition for dock style
  useFrame(() => {
    if (!meshRef.current || !dockStyle) return;

    const targetScale = isHovered ? scale * 1.3 : scale;
    const targetY = isHovered ? position[1] + 0.3 : position[1];

    // Scale lerping
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );

    // Smooth position transitions for responsive repositioning
    // Lerp x and z for viewport-driven position changes (responsive)
    // Lerp y with hover offset applied
    meshRef.current.position.x += (position[0] - meshRef.current.position.x) * 0.1;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;
    meshRef.current.position.z += (position[2] - meshRef.current.position.z) * 0.1;
  });

  const getGeometry = () => {
    switch (shape) {
      case 'icosahedron':
        return <icosahedronGeometry args={[1, 4]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1, 2]} />;
      case 'tetrahedron':
        return <tetrahedronGeometry args={[1, 0]} />;
      case 'box':
        return <boxGeometry args={[1.2, 1.2, 1.2]} />;
      case 'sphere':
        return <sphereGeometry args={[1, 32, 32]} />;
      case 'torus':
        return <torusGeometry args={[1, 0.4, 16, 100]} />;
      default:
        return <icosahedronGeometry args={[1, 4]} />;
    }
  };

  if (dockStyle) {
    return (
      <Float
        floatIntensity={floatIntensity}
        rotationIntensity={rotationIntensity}
        speed={speed}
      >
        <mesh
          ref={meshRef}
          position={position}
          rotation={[0, 0, 0]}
          scale={scale}
          onClick={onClick}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
        >
          {getGeometry()}
          <MeshTransmissionMaterial
            {...config}
            color={color}
            toneMapped={false}
          />
        </mesh>
      </Float>
    );
  }

  // Original simple hover behavior (non-dock)
  return (
    <Float
      floatIntensity={floatIntensity}
      rotationIntensity={rotationIntensity}
      speed={speed}
    >
      <mesh
        ref={meshRef}
        position={position}
        rotation={[0, 0, 0]}
        scale={scale}
        onClick={onClick}
        onPointerEnter={(e) => {
          e.object.scale.multiplyScalar(1.1);
        }}
        onPointerLeave={(e) => {
          e.object.scale.divideScalar(1.1);
        }}
      >
        {getGeometry()}
        <MeshTransmissionMaterial
          {...config}
          color={color}
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}
