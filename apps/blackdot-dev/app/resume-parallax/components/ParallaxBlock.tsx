'use client';

import { ReactNode, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ParallaxScrollState } from '../hooks/useParallaxScroll';

interface ParallaxBlockProps {
  /** Section offset index (0 for hero, 1+ for jobs) */
  offset: number;
  /** Height multiplier for section (e.g., 1.75 means 1.75x viewport height) */
  factor: number;
  /** Parallax speed multiplier (1.0 = normal, < 1.0 = slower, > 1.0 = faster) */
  parallaxFactor?: number;
  /** Scroll state from useParallaxScroll hook */
  scrollState: ParallaxScrollState;
  /** Child components (3D objects and Html) */
  children: ReactNode;
  /** Optional additional className */
  className?: string;
}

/**
 * ParallaxBlock Component
 * Positions children based on scroll offset with smooth lerp animations
 *
 * Pattern from React Three Fiber scroll example:
 * - Uses offset to position sections vertically in 3D space
 * - Uses parallaxFactor to create depth (different speeds for different layers)
 * - Updates position in useFrame with lerp for smooth animation
 *
 * @example
 * <ParallaxBlock
 *   offset={1}                    // First job section
 *   factor={1.75}                 // Section height multiplier
 *   parallaxFactor={1.0}          // Normal scroll speed
 *   scrollState={scrollState}
 * >
 *   <BuildingModel modelOffset={-3} />
 *   <Html position={[2, 0, 0]}>
 *     <JobCard job={job} />
 *   </Html>
 * </ParallaxBlock>
 */
export function ParallaxBlock({
  offset,
  factor,
  parallaxFactor = 1.0,
  scrollState,
  children,
  className
}: ParallaxBlockProps) {
  const ref = useRef<THREE.Group>(null);
  const currentY = useRef<number>(0);

  useFrame(() => {
    if (!ref.current) return;

    // Calculate target Y position based on:
    // 1. offset: which section (0, 1, 2, etc.)
    // 2. scrollState.top.current: normalized scroll (0-1)
    // 3. factor: height multiplier for this section
    // 4. parallaxFactor: speed multiplier for depth effect
    //
    // The formula creates layers at different Y positions:
    // - offset positions section vertically (0, factor*7, factor*14, etc.)
    // - scroll.top.current * factor * parallaxFactor creates the parallax motion
    //
    // Multiplier set to 7 to provide optimal spacing between sections
    // Pattern from example:
    // position.y = offset * factor - (scrollState.top.current * factor * parallaxFactor * 7)

    const targetY =
      offset * factor * 7 - scrollState.top.current * factor * parallaxFactor * 7;

    // Smooth lerp animation for motion
    // 0.1 = lerp amount (10% of distance per frame, smooth feel)
    currentY.current = THREE.MathUtils.lerp(currentY.current, targetY, 0.1);

    ref.current.position.y = currentY.current;
  });

  return (
    <group ref={ref}>
      {children}
    </group>
  );
}
