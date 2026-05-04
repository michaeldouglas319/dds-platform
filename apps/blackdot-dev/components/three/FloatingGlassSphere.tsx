'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface FloatingGlassSphereProps {
  /** Position in 3D space */
  position?: [number, number, number];

  /** Base scale of the sphere */
  scale?: number;

  /** Sphere color (transmitted through glass) */
  color?: string;

  /** Transmission level (0=opaque, 1=fully transparent) */
  transmission?: number;

  /** Glass thickness for refraction effect */
  thickness?: number;

  /** Surface roughness (0=smooth, 1=rough) */
  roughness?: number;

  /** Index of refraction (typical glass: 1.5) */
  ior?: number;

  /** Intensity of float animation */
  floatIntensity?: number;

  /** Speed of float animation */
  floatSpeed?: number;

  /** Speed of rotation animation */
  rotationSpeed?: number;

  /** Whether this sphere is interactive */
  interactive?: boolean;

  /** Callback when clicked */
  onClick?: () => void;

  /** Callback on hover */
  onHover?: (hovered: boolean) => void;
}

/**
 * FloatingGlassSphere - A realistic glass sphere with physics-based material
 *
 * Features:
 * - Realistic glass material with transmission & refraction
 * - Subtle floating animation
 * - Slow rotation
 * - Interactive hover/click states
 * - Responsive scaling
 *
 * @example
 * ```tsx
 * <FloatingGlassSphere
 *   position={[0, 2, 0]}
 *   scale={1.5}
 *   color="#4a90e2"
 *   transmission={0.95}
 *   onClick={() => console.log('Clicked')}
 * />
 * ```
 */
export const FloatingGlassSphere = ({
  position = [0, 0, 0],
  scale = 1.0,
  color = '#ffffff',
  transmission = 0.95,
  thickness = 0.5,
  roughness = 0.05,
  ior = 1.5,
  floatIntensity = 0.3,
  floatSpeed = 1.5,
  rotationSpeed = 0.5,
  interactive = true,
  onClick,
  onHover,
}: FloatingGlassSphereProps) => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [initialYPos] = useState(position[1]);

  // Memoize material to prevent recreation on every render
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      transmission, // High transparency for glass effect
      thickness, // Controls refraction intensity
      roughness, // Very smooth surface
      ior, // Index of refraction for glass
      metalness: 0, // Non-metallic
      clearcoat: 1.0, // Glossy coating
      clearcoatRoughness: 0, // Perfect clarity
      envMapIntensity: 1.0,
    });
  }, [color, transmission, thickness, roughness, ior]);

  // Animation loop: floating + rotation
  useFrame((state) => {
    if (!sphereRef.current || !groupRef.current) return;

    // Float animation: gentle up/down movement
    const floatOffset = Math.sin(state.clock.elapsedTime * floatSpeed) * floatIntensity;
    groupRef.current.position.y = initialYPos + floatOffset;

    // Rotation: slow spin on Y axis
    sphereRef.current.rotation.y += rotationSpeed * 0.01;

    // Optional: subtle rotation on X axis for visual interest
    sphereRef.current.rotation.x += rotationSpeed * 0.003;

    // Scale animation on hover
    if (interactive) {
      const targetScale = isHovered ? scale * 1.1 : scale;
      sphereRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const handlePointerOver = (e: THREE.Event & { stopPropagation?: () => void }) => {
    if (!interactive) return;
    e.stopPropagation?.();
    setIsHovered(true);
    onHover?.(true);
  };

  const handlePointerOut = (e: THREE.Event & { stopPropagation?: () => void }) => {
    if (!interactive) return;
    e.stopPropagation?.();
    setIsHovered(false);
    onHover?.(false);
  };

  const handleClick = (e: THREE.Event & { stopPropagation?: () => void }) => {
    if (!interactive) return;
    e.stopPropagation?.();
    onClick?.();
  };

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={sphereRef}
        material={material}
        scale={scale}
        onPointerOver={interactive ? handlePointerOver : undefined}
        onPointerOut={interactive ? handlePointerOut : undefined}
        onClick={interactive ? handleClick : undefined}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
    </group>
  );
};

export default FloatingGlassSphere;
