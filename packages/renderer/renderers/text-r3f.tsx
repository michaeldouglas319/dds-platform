'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import * as THREE from 'three';
import type { RendererProps } from '@dds/types';

/**
 * TextR3F - 3D text block renderer with responsive styling
 *
 * Renders multi-paragraph text with:
 * - Category badge (if available)
 * - Title and subtitle
 * - Body text and paragraphs
 * - Responsive typography
 * - Subtle 3D background animation
 * - Theme-aware indigo/green coloring
 *
 * Data structure (UniversalSection):
 * - subject.title: Main heading
 * - subject.subtitle: Subtitle
 * - subject.category: Category badge
 * - content.body: Primary paragraph
 * - content.paragraphs: Array of {subtitle, description} objects
 * - display.textAlign: 'start' | 'center' | 'end' (default: 'start')
 * - display.textWidth: 's' | 'm' | 'l' | 'xl' (default: 'l')
 */

interface TextBlockProps {
  category?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  paragraphs?: Array<{ subtitle?: string; description?: string }>;
  textAlign: 'start' | 'center' | 'end';
  textWidth: 's' | 'm' | 'l' | 'xl';
}

/**
 * Animated background geometry for text section
 */
function TextBackground() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Subtle rotation
      meshRef.current.rotation.x += delta * 0.05;
      meshRef.current.rotation.y += delta * 0.08;

      // Gentle scale pulse
      const scale = 1 + Math.sin(Date.now() * 0.001) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <icosahedronGeometry args={[3, 2]} />
      <meshStandardMaterial
        color="#4f46e5"
        emissive="#4f46e5"
        emissiveIntensity={0.15}
        transparent
        opacity={0.1}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}

/**
 * Lighting setup for text rendering
 */
function TextLighting() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, 10]} intensity={0.4} />
      <directionalLight position={[0, 10, 5]} intensity={0.6} />
    </>
  );
}

/**
 * Text content as HTML overlay
 */
function TextContent({ block }: { block: TextBlockProps }) {
  const maxWidths: Record<string, string> = {
    s: 'max-w-sm',
    m: 'max-w-md',
    l: 'max-w-3xl',
    xl: 'max-w-4xl',
  };

  const alignments: Record<string, string> = {
    start: 'text-left',
    center: 'text-center',
    end: 'text-right',
  };

  return (
    <div
      className={`mx-auto ${maxWidths[block.textWidth]} ${alignments[block.textAlign]} px-6 py-20`}
    >
      {/* Category */}
      {block.category && (
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-indigo-400">
          {block.category}
        </span>
      )}

      {/* Title */}
      {block.title && (
        <h2 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {block.title}
        </h2>
      )}

      {/* Subtitle */}
      {block.subtitle && (
        <p className="mb-6 text-lg font-medium text-neutral-300">{block.subtitle}</p>
      )}

      {/* Body */}
      {block.body && (
        <p className="mb-8 text-base leading-relaxed text-neutral-400">{block.body}</p>
      )}

      {/* Paragraphs */}
      {block.paragraphs && block.paragraphs.length > 0 && (
        <div className="space-y-8">
          {block.paragraphs.map((p, i) => (
            <div key={i}>
              {p.subtitle && (
                <h3 className="mb-3 text-lg font-semibold text-neutral-200">{p.subtitle}</h3>
              )}
              {p.description && (
                <p className="leading-relaxed text-neutral-400">{p.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Main text renderer component
 */
export const TextR3F = ({ section }: RendererProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const textBlock: TextBlockProps = {
    category: section.subject?.category,
    title: section.subject?.title,
    subtitle: section.subject?.subtitle,
    body: section.content?.body,
    paragraphs: section.content?.paragraphs,
    textAlign: section.display?.textAlign ?? 'start',
    textWidth: section.display?.textWidth ?? 'l',
  };

  return (
    <div className="relative w-full bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden">
      {/* 3D Background Canvas */}
      <div className="absolute inset-0 h-screen">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <TextBackground />
          <TextLighting />
        </Canvas>
      </div>

      {/* Text Content Overlay */}
      <div className="relative z-10 min-h-screen">
        <div
          className={`transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <TextContent block={textBlock} />
        </div>
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-neutral-950/40 via-transparent to-neutral-950/40" />
    </div>
  );
};

export default TextR3F;
