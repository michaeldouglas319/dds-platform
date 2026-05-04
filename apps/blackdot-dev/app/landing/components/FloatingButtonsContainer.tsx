'use client'

import { useRef } from 'react';
import { FloatingButtonShape } from './FloatingButtonShape';
import { useResponsiveButtonPositions } from '../hooks/useResponsiveButtonPositions';
import * as THREE from 'three';

export interface FloatingButton {
  id: string;
  position: [number, number, number];
  color: string;
  shape: 'icosahedron' | 'octahedron' | 'tetrahedron' | 'box' | 'sphere' | 'torus';
  scale?: number;
  floatIntensity?: number;
  rotationIntensity?: number;
  speed?: number;
  label?: string;
  onClick?: () => void;
  dockStyle?: boolean;
}

interface FloatingButtonsContainerProps {
  buttons: FloatingButton[];
  dockStyle?: boolean;
  baseConfig?: {
    bottomY?: number;
    spacing?: number;
    zDepth?: number;
  };
}

export function FloatingButtonsContainer({
  buttons,
  dockStyle = true,
  baseConfig = {
    bottomY: -6,
    spacing: 0.7,
    zDepth: 0
  }
}: FloatingButtonsContainerProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Get responsive positions based on viewport
  const responsivePositions = useResponsiveButtonPositions(buttons.length, baseConfig);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {buttons.map((button, index) => (
        <FloatingButtonShape
          key={button.id}
          position={responsivePositions[index]}
          color={button.color}
          shape={button.shape}
          scale={button.scale ?? 1}
          floatIntensity={button.floatIntensity ?? 0.5}
          rotationIntensity={button.rotationIntensity ?? 0.5}
          speed={button.speed ?? 2}
          onClick={button.onClick}
          dockStyle={button.dockStyle ?? dockStyle}
        />
      ))}
    </group>
  );
}
