'use client';

import React, { ReactNode, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitalState } from '../hooks/useOrbitalState';

interface OrbitContainerProps {
  /** Orbital state from useOrbitalState hook */
  orbital: OrbitalState;
  /** Radius of the orbital path (world units) */
  radius?: number;
  /** Children to render in orbit (OrbitCard components) */
  children: ReactNode;
  /** Y-axis position of the orbit */
  orbitY?: number;
  /** Z-axis position of the orbit */
  orbitZ?: number;
  /** Lerp amount for smooth rotation (0-1) */
  lerpAmount?: number;
}

/**
 * OrbitContainer Component
 * Manages orbital positioning and rotation for card carousel
 *
 * Architecture:
 * - Accepts child OrbitCard components
 * - Positions them in a circular orbit using trigonometry
 * - Smoothly rotates the entire orbit based on selected card
 * - Children receive position/rotation data via context or direct positioning
 *
 * Math:
 * - Cards positioned at angles: (index / totalCards) * 2π
 * - Card position: {x: cos(angle) * radius, y, z: sin(angle) * radius}
 * - Orbit rotates to bring selected card to front (angle = 0)
 *
 * @example
 * <OrbitContainer orbital={orbitalState} radius={20}>
 *   {jobs.map((job, idx) => (
 *     <OrbitCard key={idx} job={job} index={idx} />
 *   ))}
 * </OrbitContainer>
 */
export function OrbitContainer({
  orbital,
  radius = 20,
  children,
  orbitY = 2,
  orbitZ = 0,
  lerpAmount = 0.1
}: OrbitContainerProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Smooth rotation animation in useFrame
  useFrame(() => {
    if (!groupRef.current) return;

    // Lerp from current rotation to target rotation
    // target is the angle needed to bring selected card to front (z-axis)
    orbital.currentRotation.current = THREE.MathUtils.lerp(
      orbital.currentRotation.current,
      orbital.targetRotation,
      lerpAmount
    );

    // Apply rotation to entire orbit
    groupRef.current.rotation.y = orbital.currentRotation.current;
  });

  return (
    <group ref={groupRef} position={[0, orbitY, orbitZ]}>
      {/* Render each card with positioning */}
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        // Calculate angle for this card in the orbit
        const anglePerCard = (Math.PI * 2) / orbital.totalCards;
        const angle = index * anglePerCard;

        // Calculate position in orbit
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Clone the child element and inject position props
        return React.cloneElement(child, {
          // @ts-ignore - Passing position props to OrbitCard
          orbitAngle: angle,
          orbitRadius: radius,
          isSelected: index === orbital.selectedIndex,
          onSelect: () => orbital.selectCard(index)
        } as any);
      })}
    </group>
  );
}
