'use client';

import { ProfileImageDisk } from '@/app/landing-v2/components/ProfileImageDisk';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export interface Resume3DProps {
  position?: [number, number, number];
  scale?: number;
}

/**
 * Profile3D - 3D profile display with image, initials, and name using drei
 * Renders above SignIn form
 */
export const Resume3D = ({
  position = [0, 2, 0],
  scale = 1,
}: Resume3DProps) => {
  const profileTexture = useTexture('/assets/michael_douglas_profile.png');

  return (
    <group position={position} scale={scale}>
      {/* Accent lighting */}
      <pointLight position={[-2, 0.5, 1]} intensity={1} color="#6366f1" distance={10} />
      <pointLight position={[2, 0.5, 1]} intensity={1} color="#4f46e5" distance={10} />
      <Text
        position={[0, -0.3, 0]}
        fontSize={.7}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight={900}
      >
        Resume
      </Text>

      {/* Name text */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.19}
        color="#e0e7ff"
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
        letterSpacing={0.12}
      >
        
        Download Resume PDF
      </Text>
    </group>
  );
};

export default Resume3D;
