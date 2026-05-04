'use client';

import { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { JobSection } from '@/lib/config/content';

interface OrbitCardProps {
  /** Job data to render */
  job: JobSection;
  /** Index in orbital array */
  index: number;
  /** Angle in orbit (radians) */
  orbitAngle: number;
  /** Orbital radius */
  orbitRadius: number;
  /** Is this card currently selected */
  isSelected: boolean;
  /** Callback when card is clicked */
  onSelect: () => void;
  /** Scale for HTML content */
  htmlScale?: number;
}

/**
 * Hook for responsive HTML scale based on window width
 * Ensures HTML content scales appropriately for different screen sizes
 */
function useResponsiveHtmlScale() {
  const [scale, setScale] = useState(0.15);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;

      // Base scale for 1920px screens - set to 0.15 for orbital carousel
      const baseWidth = 1920;
      const baseScale = 0.15;

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

/**
 * OrbitCard Component
 * Individual card in the orbital carousel
 *
 * Features:
 * - Positioned in 3D orbit based on angle and radius
 * - Face-forward orientation (always faces camera)
 * - Glass morphism design
 * - Click to select and bring to front
 * - Responsive scaling
 *
 * Design:
 * - Glass card with job information
 * - Highlight effect when selected
 * - Compact layout for orbital arrangement
 *
 * @example
 * <OrbitCard
 *   job={job}
 *   index={0}
 *   orbitAngle={0}
 *   orbitRadius={20}
 *   isSelected={true}
 *   onSelect={handleSelect}
 * />
 */
export function OrbitCard({
  job,
  index,
  orbitAngle,
  orbitRadius,
  isSelected,
  onSelect,
  htmlScale: customScale
}: OrbitCardProps) {
  // Always call hook first (rules of hooks)
  const responsiveScale = useResponsiveHtmlScale();
  const htmlScale = customScale ?? responsiveScale;

  // Calculate 3D position in orbit
  const x = Math.cos(orbitAngle) * orbitRadius;
  const z = Math.sin(orbitAngle) * orbitRadius;
  const y = 0;

  return (
    <group position={[x, y, z]}>
      {/* Card always faces camera (forward on z-axis) */}
      <Html position={[0, 0, 0]} transform scale={htmlScale} onClick={onSelect}>
        <div
          className={`
            w-screen max-w-xs rounded-xl shadow-xl border transition-all duration-300 cursor-pointer
            ${
              isSelected
                ? 'bg-background/95 backdrop-blur-lg border-blue-500/50 ring-2 ring-blue-500/30 scale-105'
                : 'bg-background/80 backdrop-blur-lg border-border hover:border-border/80 hover:bg-background/90'
            }
          `}
          style={{
            padding: '1.5rem'
          }}
        >
          {/* Company Header */}
          <div className="mb-4">
            <h2
              className="text-2xl font-black tracking-tight mb-1"
              style={{ color: job.color }}
            >
              {job.company}
            </h2>
            <h3 className="text-base font-semibold text-foreground/80 mb-1">
              {job.role}
            </h3>
            <p className="text-xs text-foreground/60">{job.period}</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border mb-3" />

          {/* Content Summary */}
          <div className="space-y-2 mb-3">
            <p className="text-xs font-semibold text-foreground/90">
              {job.content.heading}
            </p>

            {/* Show only first paragraph in card preview */}
            {job.content.paragraphs.length > 0 && (
              <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2">
                {job.content.paragraphs[0]}
              </p>
            )}
          </div>

          {/* Key Skills Preview */}
          {job.content.highlights && job.content.highlights.length > 0 && (
            <div className="space-y-1 pt-3 border-t border-border">
              <p className="text-xs font-semibold text-foreground/80 mb-2">
                Skills
              </p>
              <div className="flex flex-wrap gap-1">
                {job.content.highlights.slice(0, 3).map((highlight, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: job.color + '20',
                      color: job.color,
                      border: `1px solid ${job.color}40`
                    }}
                  >
                    {highlight}
                  </span>
                ))}
                {job.content.highlights.length > 3 && (
                  <span className="text-xs px-2 py-1 text-foreground/60">
                    +{job.content.highlights.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Selection Indicator */}
          {isSelected && (
            <div className="mt-3 pt-3 border-t border-blue-500/30 text-center">
              <p className="text-xs font-semibold text-blue-500">
                ← Click to view details
              </p>
            </div>
          )}
        </div>
      </Html>

      {/* Card background plane for depth */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[4.8, 7]} />
        <meshStandardMaterial
          color={job.color}
          emissive={job.color}
          emissiveIntensity={isSelected ? 0.1 : 0.02}
          transparent
          opacity={isSelected ? 0.15 : 0.05}
        />
      </mesh>
    </group>
  );
}
