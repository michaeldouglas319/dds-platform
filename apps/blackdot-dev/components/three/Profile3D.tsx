'use client';

import { ProfileImageDisk } from '@/app/landing-v2/components/ProfileImageDisk';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export interface Profile3DProps {
  position?: [number, number, number];
  scale?: number;
}

/**
 * Profile3D - 3D profile display with image, initials, and name using drei
 * Renders above SignIn form
 */
export const Profile3D = ({
  position = [0, 2, 0],
  scale = 1,
}: Profile3DProps) => {
  const profileTexture = useTexture('/assets/michael_douglas_profile.png');

  return (
    <group position={position} scale={scale}>
      {/* Accent lighting */}
      <pointLight position={[-2, 0.5, 1]} intensity={1} color="#6366f1" distance={10} />
      <pointLight position={[2, 0.5, 1]} intensity={1} color="#4f46e5" distance={10} />

      {/* Profile image circle */}
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.0, 0.0, 0.0, 64]} />
        <meshStandardMaterial
          map={profileTexture}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>
      <ProfileImageDisk
              scale={1.3}
              position={[0, 2, -2]}
              metalness={0.0}
              roughness={0.1}
              emissive={0}
              
            />

      {/* MD Initials */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight={900}
      >
        MD
      </Text>

      {/* Name text */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.3}
        color="#e0e7ff"
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
        letterSpacing={0.12}
      >
        
        Welcome
      </Text>
    </group>
  );
};

export default Profile3D;
