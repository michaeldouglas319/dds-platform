'use client';

import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Mesh, Group } from 'three';
import * as THREE from 'three';
import type { RendererProps } from '@dds/types';
import { SceneWithFallback } from '../lib/SceneWithFallback';

/**
 * IntroR3F - Animated intro section with staggered text reveal and 3D effects
 *
 * Interactive features:
 * - Staggered text animation on load
 * - Clickable text elements that trigger animations
 * - 3D morphing geometry background
 * - Responsive scaling
 *
 * Data structure (UniversalSection):
 * - subject.title: main heading
 * - subject.subtitle: secondary heading
 * - content.body: description text
 * - display.animate?: 'fade' | 'slide' | 'scale' (default: 'fade')
 * - display.animationDuration?: number (default: 600)
 * - meta.staggerDelay?: number (default: 100)
 */

interface AnimatedTextProps {
  text: string;
  delay: number;
  scale?: number;
  color?: string;
  position: [number, number, number];
}

/**
 * Animated text element
 */
function AnimatedText({ text, delay, scale = 1, color = '#ffffff', position }: AnimatedTextProps) {
  const meshRef = useRef<Mesh>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useFrame((_, delta) => {
    if (meshRef.current && isVisible) {
      // Fade in and scale up
      const opacity = Math.min(1, (meshRef.current.userData.opacity || 0) + delta * 2);
      meshRef.current.userData.opacity = opacity;
      meshRef.current.scale.lerp(
        new THREE.Vector3(scale, scale, scale),
        delta * 2
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={isVisible ? scale : 0}
      userData={{ opacity: 0 }}
    >
      <planeGeometry args={[text.length * 0.6, 1]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={isVisible ? 1 : 0}
      />
    </mesh>
  );
}

/**
 * Morphing background geometry
 */
function MorphingGeometry() {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (meshRef.current) {
      timeRef.current += delta * 0.5;

      // Update geometry positions for morphing effect
      const geometry = meshRef.current.geometry;
      const positionAttribute = geometry.getAttribute('position');

      if (positionAttribute.array instanceof Float32Array) {
        const positions = positionAttribute.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const y = positions[i + 1];
          const z = positions[i + 2];

          // Wave-like deformation
          const newZ =
            Math.sin(x * 0.5 + timeRef.current) *
            Math.cos(y * 0.5 + timeRef.current) *
            0.3;
          positions[i + 2] = z + newZ;
        }
        positionAttribute.needsUpdate = true;
      }

      // Rotate for visual interest
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -3]} scale={[3, 3, 3]}>
      <icosahedronGeometry args={[1, 4]} />
      <meshPhongMaterial
        color="#4f46e5"
        emissive="#818cf8"
        wireframe
        opacity={0.1}
        transparent
      />
    </mesh>
  );
}

/**
 * Interactive button that triggers replay
 */
interface PlayButtonProps {
  position: [number, number, number];
  onClick: () => void;
}

function PlayButton({ position, onClick }: PlayButtonProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        delta * 3
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <boxGeometry args={[1.2, 0.5, 0.1]} />
      <meshStandardMaterial
        color={hovered ? '#059669' : '#10b981'}
        emissive={hovered ? '#10b981' : '#000000'}
      />
    </mesh>
  );
}

/**
 * Main intro scene
 */
function IntroScene({
  title,
  subtitle,
  description,
  onReplay,
  animationKey,
}: {
  title: string;
  subtitle: string;
  description: string;
  onReplay: () => void;
  animationKey: number;
}) {
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef} key={animationKey}>
      {/* Background geometry */}
      <MorphingGeometry />

      {/* Title */}
      <AnimatedText
        text={title}
        delay={0}
        scale={1.5}
        color="#ffffff"
        position={[0, 2, 0]}
      />

      {/* Subtitle */}
      <AnimatedText
        text={subtitle}
        delay={150}
        scale={1.2}
        color="#818cf8"
        position={[0, 1, 0]}
      />

      {/* Description */}
      <AnimatedText
        text={description.substring(0, 40)}
        delay={300}
        scale={0.8}
        color="#d1d5db"
        position={[0, 0, 0]}
      />

      {/* Play/Replay button */}
      <PlayButton position={[0, -1.5, 0]} onClick={onReplay} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 10, 7]} intensity={1} />
      <pointLight position={[-5, 5, -5]} intensity={0.6} />
    </group>
  );
}

/**
 * Main intro renderer
 */
export const IntroR3F = ({ section }: RendererProps) => {
  const [animationKey, setAnimationKey] = useState(0);

  const title = section.subject?.title || 'Welcome';
  const subtitle = section.subject?.subtitle || 'Interactive Intro';
  const description = section.content?.body || 'Click the button to replay animation';

  const handleReplay = () => {
    setAnimationKey((k) => k + 1);
  };

  return (
    <SceneWithFallback height="100vh" className="relative w-full overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
      {/* 3D Canvas with error boundary and Suspense */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        aria-hidden
      >
        <IntroScene
          title={title}
          subtitle={subtitle}
          description={description}
          onReplay={handleReplay}
          animationKey={animationKey}
        />
      </Canvas>

      {/* HTML UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        {/* Content shown during animation sequence */}
        <div className="pointer-events-auto space-y-4 text-center">
          <h1 className="text-5xl font-bold text-white opacity-0 animate-fade-in">
            {title}
          </h1>
          <p className="text-2xl text-indigo-400 opacity-0 animate-fade-in animation-delay-150">
            {subtitle}
          </p>
          <p className="text-neutral-400 opacity-0 animate-fade-in animation-delay-300 max-w-2xl">
            {description}
          </p>
        </div>
      </div>

      {/* Replay button overlay */}
      <button
        onClick={handleReplay}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-lg bg-green-600 px-6 py-3 text-white transition-all hover:bg-green-500 active:scale-95"
      >
        Replay Animation
      </button>

      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>
    </SceneWithFallback>
  );
};

export default IntroR3F;
