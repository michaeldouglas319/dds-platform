'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import * as THREE from 'three';
import type { RendererProps } from '@dds/types';

/**
 * CenteredTextR3F - Centered text with animated reveal and 3D background
 *
 * Renders centered text block with:
 * - Animated staggered text reveal on mount
 * - 3D morphing geometry background
 * - Max-width constraint for readability
 * - Theme-aware colors (indigo primary, neutral secondary)
 * - Responsive scaling and typography
 *
 * Data structure (UniversalSection):
 * - subject.title: Main heading
 * - subject.subtitle: Subtitle (displayed smaller)
 * - content.body: Primary text block
 * - display.contentWidth: Max-width constraint (e.g., 'max-w-2xl')
 * - meta.staggerDelay?: number (default: 50ms per line)
 * - meta.animationDuration?: number (default: 800ms)
 */

/**
 * Morphing geometry background
 */
function MorphingGeometry() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotate
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;

      // Scale pulse with sine wave
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }

    // Animate emissive intensity
    if (materialRef.current) {
      materialRef.current.emissiveIntensity =
        0.2 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -6]}>
      <octahedronGeometry args={[2.5, 1]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#10b981"
        emissive="#10b981"
        emissiveIntensity={0.2}
        transparent
        opacity={0.12}
        metalness={0.4}
        roughness={0.6}
        wireframe={false}
      />
    </mesh>
  );
}

/**
 * Particle field effect
 */
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (particlesRef.current && particlesRef.current.rotation) {
      particlesRef.current.rotation.y += delta * 0.02;
    }
  });

  const particleCount = 100;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 20;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        color="#4f46e5"
        size={0.1}
        opacity={0.3}
        transparent
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Lighting setup
 */
function CenteredTextLighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[15, 15, 15]} intensity={1} />
      <pointLight position={[-15, -15, 15]} intensity={0.6} />
      <directionalLight position={[5, 15, 10]} intensity={0.8} color="#10b981" />
    </>
  );
}

/**
 * Text reveal animation hook
 */
function useTextReveal() {
  const [revealedLines, setRevealedLines] = useState<number>(0);

  useEffect(() => {
    let currentLine = 0;
    const staggerDelay = 50; // ms per line

    const interval = setInterval(() => {
      currentLine++;
      setRevealedLines(currentLine);
    }, staggerDelay);

    return () => clearInterval(interval);
  }, []);

  return revealedLines;
}

/**
 * Animated text content
 */
function AnimatedTextContent({
  title,
  subtitle,
  body,
  revealedLines,
}: {
  title?: string;
  subtitle?: string;
  body?: string;
  revealedLines: number;
}) {
  const lines = body?.split('\n') || [];

  return (
    <div className="max-w-2xl text-center">
      {/* Title */}
      {title && (
        <div
          className={`transition-all duration-700 transform ${
            revealedLines > 0
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <h2 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
            {title}
          </h2>
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <div
          className={`mt-6 transition-all duration-700 transform ${
            revealedLines > 1
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-lg font-medium text-neutral-300">{subtitle}</p>
        </div>
      )}

      {/* Body paragraphs with staggered reveal */}
      {lines.length > 0 && (
        <div className="mt-8 space-y-4">
          {lines.map((line, index) => (
            <div
              key={index}
              className={`transition-all duration-500 transform ${
                revealedLines > index + 2
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2'
              }`}
            >
              <p className="text-base leading-relaxed text-neutral-400">
                {line}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Single paragraph body (if no newlines) */}
      {!body?.includes('\n') && body && (
        <div
          className={`mt-8 transition-all duration-700 transform ${
            revealedLines > 1
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="text-base leading-relaxed text-neutral-400">{body}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Main centered text renderer component
 */
export const CenteredTextR3F = ({ section }: RendererProps) => {
  const revealedLines = useTextReveal();

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden flex items-center justify-center">
      {/* 3D Background Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <MorphingGeometry />
          <ParticleField />
          <CenteredTextLighting />
        </Canvas>
      </div>

      {/* Text Content Overlay */}
      <div className="relative z-10 px-6 py-20 max-w-4xl">
        <AnimatedTextContent
          title={section.subject?.title}
          subtitle={section.subject?.subtitle}
          body={section.content?.body}
          revealedLines={revealedLines}
        />
      </div>

      {/* Gradient vignette for text readability */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-neutral-950/30 via-transparent to-neutral-950/30" />

      {/* Corner accent lights */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-600/10 to-transparent blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-green-600/10 to-transparent blur-3xl rounded-full pointer-events-none" />
    </div>
  );
};

export default CenteredTextR3F;
