'use client';

import React, { useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FrostedGlassTile } from '@/components/bubble/GlassTile';
import { useClerk } from '@clerk/nextjs';
import { useNavigationVisibility } from '@/lib/contexts';

interface Navigation3DMinimalProps {
  // Optional props - if not provided, uses context
  isVisible?: boolean;
  onClose?: () => void;
  onLoginClick?: () => void;
}

/**
 * 3D Navigation Bar with Frosted Glass Effect
 *
 * Features:
 * - Frosted glass background with depth
 * - 3D text rendering
 * - Interactive close button
 * - Positioned in screen space (top-left)
 * - MeshStandardMaterial for realistic glass
 * - Integrates with NavigationVisibilityContext
 */
export function Navigation3DMinimal({
  isVisible: visibleProp,
  onClose: onCloseProp,
  onLoginClick,
}: Navigation3DMinimalProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isHoveredClose, setIsHoveredClose] = useState(false);
  const [isHoveredLogin, setIsHoveredLogin] = useState(false);

  // Use context values if props not provided
  const { isVisible: contextIsVisible, setIsVisible } = useNavigationVisibility();
  const { openSignIn } = useClerk();

  const isVisible = visibleProp !== undefined ? visibleProp : contextIsVisible;
  const onClose = onCloseProp || (() => setIsVisible(false));
  const handleLoginClick = onLoginClick || (() => openSignIn());

  // Floating animation
  useFrame(() => {
    if (groupRef.current && isVisible) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.0005) * 0.15;
    }
  });

  if (!isVisible) {
    return null;
  }

  return (
    <group ref={groupRef} position={[-8, 4.5, 5]}>
      {/* Frosted glass background panel */}
      <FrostedGlassTile
        position={[0, 0, -0.1]}
        scale={[4.2, 0.8]}
        color="#1a1a2e"
        opacity={0.35}
      />

      {/* Logo text - DDS */}
      <Text
        position={[-1.8, 0, 0.05]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
      >
        DDS
      </Text>

      {/* Theme toggle indicator (circle) */}
      <mesh position={[0.8, 0, 0.1]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.7}
          roughness={0.2}
          emissive="#fbbf24"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Login button area */}
      <group position={[1.3, 0, 0.05]}>
        {/* Hover glow for login button */}
        {isHoveredLogin && (
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[0.6, 0.5]} />
            <meshStandardMaterial
              color="#3b82f6"
              transparent
              opacity={0.3}
              emissive="#3b82f6"
              emissiveIntensity={0.4}
            />
          </mesh>
        )}

        {/* Login text */}
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.28}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight={600}
        >
          Login
        </Text>

        {/* Invisible clickable plane */}
        <mesh
          position={[0, 0, 0.2]}
          onPointerOver={() => setIsHoveredLogin(true)}
          onPointerOut={() => setIsHoveredLogin(false)}
          onClick={handleLoginClick}
        >
          <planeGeometry args={[0.6, 0.5]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* Close button (X) */}
      <group position={[1.95, 0, 0.05]}>
        {/* Hover glow for close button */}
        {isHoveredClose && (
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[0.4, 0.4]} />
            <meshStandardMaterial
              color="#ef4444"
              transparent
              opacity={0.25}
              emissive="#ef4444"
              emissiveIntensity={0.5}
            />
          </mesh>
        )}

        {/* X text */}
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.32}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
          fontWeight={700}
        >
          ✕
        </Text>

        {/* Invisible clickable plane */}
        <mesh
          position={[0, 0, 0.2]}
          onPointerOver={() => setIsHoveredClose(true)}
          onPointerOut={() => setIsHoveredClose(false)}
          onClick={onClose}
        >
          <planeGeometry args={[0.4, 0.4]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* Depth accent planes */}
      <mesh position={[-2.1, -0.4, 0.05]}>
        <planeGeometry args={[4.2, 0.05]} />
        <meshStandardMaterial
          color="#3b82f6"
          transparent
          opacity={0.2}
          emissive="#3b82f6"
          emissiveIntensity={0.2}
        />
      </mesh>

      <mesh position={[-2.1, 0.4, 0.05]}>
        <planeGeometry args={[4.2, 0.05]} />
        <meshStandardMaterial
          color="#3b82f6"
          transparent
          opacity={0.2}
          emissive="#3b82f6"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}
