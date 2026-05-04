'use client';

import { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { ParallaxBlock } from './ParallaxBlock';
import type { ParallaxScrollState } from '../hooks/useParallaxScroll';
import { useMobileDetection } from '@/hooks';

/**
 * Hook for responsive HTML scale based on window width
 * Ensures HTML content scales appropriately for different screen sizes
 * Prevents content from becoming microscopic on large displays
 */
function useResponsiveHtmlScale() {
  const [scale, setScale] = useState(0.12);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;

      // Base scale for 1920px screens - set to 0.12 for balanced readability and viewport fit
      const baseWidth = 1920;
      const baseScale = 0.12;

      // Scale proportionally for larger screens
      const scaleFactor = Math.min(width / baseWidth, 2); // Cap at 2x
      setScale(baseScale * scaleFactor);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return scale;
}

interface HeroBlockProps {
  /** Scroll state from useParallaxScroll */
  scrollState: ParallaxScrollState;
  /** Optional additional styling */
  className?: string;
}

/**
 * HeroBlock Component
 * Hero section for parallax resume layout
 *
 * Features:
 * - Centered hero content with minimal parallax
 * - Title, subtitle, and call-to-action
 * - Glass morphism design system integration
 * - Scroll progress indicator
 *
 * Design:
 * - Foreground parallax factor (0.5) creates depth perception
 * - Centered positioning for prominent display
 * - Responsive scaling for different viewport sizes
 *
 * @example
 * <HeroBlock scrollState={scrollState} />
 */
export function HeroBlock({ scrollState, className }: HeroBlockProps) {
  const isMobile = useMobileDetection(768);
  const htmlScale = useResponsiveHtmlScale();

  return (
    <ParallaxBlock
      offset={0}
      factor={1.75}
      parallaxFactor={0.5} // Foreground parallax
      scrollState={scrollState}
      className={className}
    >
      {/* Hero Content */}
      <Html position={[0, 0, 2]} transform scale={htmlScale}>
        <div className="w-screen flex items-center justify-center">
          <div className="max-w-2xl text-center space-y-8 px-4">
            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Parallax
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Resume Explorer
              </h2>
            </div>

            {/* Subtitle */}
            <div className="space-y-3">
              <p className="text-base text-foreground/70">
                Experience a cinematic view of professional journey
              </p>
              <p className="text-sm text-foreground/50">
                Scroll down to explore positions, skills, and achievements
              </p>
            </div>

            {/* Glass Card with Info */}
            <div className="mt-12 bg-background/50 backdrop-blur-lg border border-border rounded-xl p-6 max-w-sm mx-auto">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-foreground/60 mb-1">
                      Total Positions
                    </p>
                    <p className="text-3xl font-black text-blue-500">6</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60 mb-1">
                      Years Experience
                    </p>
                    <p className="text-3xl font-black text-purple-500">7+</p>
                  </div>
                </div>

                <div className="h-px bg-border" />

                <p className="text-xs text-foreground/70 leading-relaxed">
                  Full-stack engineer with expertise in systems design, AI/ML integration,
                  and performance optimization
                </p>

                <div className="pt-2">
                  <p className="text-xs text-foreground/50 mb-2">Scroll to begin</p>
                  <div className="w-6 h-10 border border-foreground/30 rounded-full mx-auto flex items-center justify-center">
                    <div className="w-1 h-2 bg-foreground/30 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            </div>

            {/* Version Label */}
            <div className="pt-8">
              <span className="text-xs font-semibold text-foreground/40 uppercase tracking-widest">
                Parallax v1.0
              </span>
            </div>
          </div>
        </div>
      </Html>

      {/* Background gradient plane */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#1a1a2e"
          emissiveIntensity={0.3}
        />
      </mesh>
    </ParallaxBlock>
  );
}
