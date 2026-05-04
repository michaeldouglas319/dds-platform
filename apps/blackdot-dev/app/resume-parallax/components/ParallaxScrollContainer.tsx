'use client';

import { ReactNode, useMemo, useState, useEffect, useLayoutEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import type { ParallaxScrollState } from '../hooks/useParallaxScroll';

interface ParallaxScrollContainerProps {
  /** Total number of sections for height calculation */
  totalSections: number;
  /** Height multiplier per section (default: 1.75) */
  sectionHeightFactor?: number;
  /** Scroll state from useParallaxScroll */
  scrollState: ParallaxScrollState;
  /** 3D Scene component to render in Canvas */
  children: ReactNode;
  /** Optional canvas configuration */
  canvasProps?: Partial<Parameters<typeof Canvas>[0]>;
  /** Optional scroll area className */
  scrollClassName?: string;
}

/**
 * ParallaxScrollContainer Component
 * Creates a fixed 3D Canvas with an invisible scroll driver div
 *
 * Architecture:
 * - Fixed Canvas at z-0 (never scrolls, updates via scroll listener)
 * - Invisible scroll driver div that determines total scroll height
 * - Scene renders based on scroll position stored in ref
 *
 * Pattern from React Three Fiber scroll example:
 * ```
 * <Canvas>
 *   <Content />
 * </Canvas>
 * <div className="scrollArea" onScroll={onScroll}>
 *   {// Invisible spacer divs for each section}
 * </div>
 * ```
 *
 * @example
 * <ParallaxScrollContainer
 *   totalSections={6}
 *   sectionHeightFactor={1.75}
 *   scrollState={scrollState}
 * >
 *   <ParallaxResumeScene scrollState={scrollState} />
 * </ParallaxScrollContainer>
 */
export function ParallaxScrollContainer({
  totalSections,
  sectionHeightFactor = 1.75,
  scrollState,
  children,
  canvasProps,
  scrollClassName
}: ParallaxScrollContainerProps) {
  // Calculate total scroll height based on sections and window height
  // Use state to avoid hydration mismatch (window doesn't exist on server)
  const [totalScrollHeight, setTotalScrollHeight] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  // Use useLayoutEffect to set height before paint, preventing 0-height flash
  useLayoutEffect(() => {
    const height = totalSections * window.innerHeight * sectionHeightFactor;
    setTotalScrollHeight(height);
    setIsMounted(true);

    // Recalculate on window resize
    const handleResize = () => {
      const newHeight = totalSections * window.innerHeight * sectionHeightFactor;
      setTotalScrollHeight(newHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [totalSections, sectionHeightFactor]);

  // Show placeholder until height is calculated to prevent content jump
  if (!isMounted) {
    return <div className="w-full h-screen bg-background" />;
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-background">
      {/* Fixed Canvas - never scrolls, always visible */}
      <div className="fixed inset-0 z-0 w-full h-screen">
        <Canvas
          orthographic
          camera={{
            position: [0, 0, 200],
            zoom: 80,
            near: 0.1,
            far: 2000
          }}
          {...canvasProps}
        >
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </Canvas>
      </div>

      {/* Scroll Driver - invisible div that determines document height */}
      {/* This div's height controls how much the user can scroll */}
      <div
        className={scrollClassName}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: `${totalScrollHeight}px`,
          pointerEvents: 'none' // Don't block interaction
        }}
      />
    </div>
  );
}
