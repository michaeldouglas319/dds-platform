'use client';

import { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import type { JobSection } from '@/lib/config/content';
import { ParallaxBlock } from './ParallaxBlock';
import type { ParallaxScrollState } from '../hooks/useParallaxScroll';

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

interface JobBlockProps {
  /** Job data to render */
  job: JobSection;
  /** Section offset index in parallax layout */
  offset: number;
  /** Alignment direction: 'left' = model left + card right, 'right' = model right + card left */
  align: 'left' | 'right';
  /** Scroll state from useParallaxScroll */
  scrollState: ParallaxScrollState;
  /** Optional additional styling */
  className?: string;
}

/**
 * JobBlock Component
 * Renders a job section with 3D model and glass morphism HTML card
 *
 * Layout:
 * - Model positioned at modelX (left or right)
 * - Content card positioned opposite the model
 * - Both contained in a ParallaxBlock for scroll-based positioning
 *
 * Design System:
 * - Glass morphism: bg-background/90 backdrop-blur-lg border border-border
 * - Typography: Job color for heading, foreground/80 for body
 * - Spacing: Consistent padding and gaps from DDS V3
 *
 * @example
 * <JobBlock
 *   job={resumeJobs[0]}
 *   offset={1}
 *   align="left"
 *   scrollState={scrollState}
 * />
 */
export function JobBlock({
  job,
  offset,
  align,
  scrollState,
  className
}: JobBlockProps) {
  // Get responsive scale based on screen width
  const htmlScale = useResponsiveHtmlScale();

  // Position models at different X based on alignment
  const modelX = align === 'left' ? -6 : 6;
  const contentX = align === 'left' ? 3 : -3;

  return (
    <ParallaxBlock
      offset={offset}
      factor={1.75}
      parallaxFactor={1.0}
      scrollState={scrollState}
      className={className}
    >
      {/* HTML Content Card */}
      <Html position={[contentX, 0, 2]} transform scale={htmlScale}>
        <div className="w-screen max-w-xs bg-background/90 backdrop-blur-lg border border-border rounded-xl p-6 shadow-xl">
          {/* Company Header */}
          <div className="mb-6">
            <h2
              className="text-4xl font-black tracking-tight mb-2"
              style={{ color: job.color }}
            >
              {job.company}
            </h2>
            <h3 className="text-2xl font-semibold text-foreground/80 mb-2">
              {job.role}
            </h3>
            <p className="text-xs text-foreground/60">{job.period}</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border mb-6" />

          {/* Content */}
          <div className="space-y-3 mb-6">
            <p className="text-base font-semibold text-foreground/90">
              {job.content.heading}
            </p>

            {job.content.paragraphs.map((paragraph, idx) => (
              <p
                key={idx}
                className="text-sm text-foreground/70 leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Highlights */}
          {job.content.highlights && job.content.highlights.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-foreground/80 mb-2">
                Key Skills
              </p>
              <div className="grid grid-cols-1 gap-1">
                {job.content.highlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-foreground/70"
                  >
                    <span
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: job.color }}
                    />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Html>
    </ParallaxBlock>
  );
}
