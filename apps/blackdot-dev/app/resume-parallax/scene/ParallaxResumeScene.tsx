'use client';

import { Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { ParallaxCamera } from './components/ParallaxCamera';
import { HeroBlock } from '../components/HeroBlock';
import { JobBlock } from '../components/JobBlock';
import { resumeJobs } from '@/lib/config/content';
import type { ParallaxScrollState } from '../hooks/useParallaxScroll';

interface ParallaxResumeSceneProps {
  /** Scroll state from useParallaxScroll hook */
  scrollState: ParallaxScrollState;
}

/**
 * ParallaxResumeScene Component
 * 3D scene for parallax resume layout
 *
 * Architecture:
 * - ParallaxCamera that follows scroll
 * - Lighting and environment setup
 * - HeroBlock for hero section
 * - JobBlocks for each job with 3D models and HTML overlays
 * - Background environment
 *
 * @example
 * <Canvas orthographic>
 *   <ParallaxResumeScene scrollState={scrollState} />
 * </Canvas>
 */
export function ParallaxResumeScene({ scrollState }: ParallaxResumeSceneProps) {
  return (
    <>
      {/* Camera follows scroll */}
      <ParallaxCamera scrollState={scrollState} zoom={100} lerpAmount={0.1} />

      {/* Lighting setup */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />

      {/* Optional: Environment for better lighting */}
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      {/* Hero Section */}
      <HeroBlock scrollState={scrollState} />

      {/* Job Sections */}
      {resumeJobs.map((job, index) => (
        <JobBlock
          key={job.id}
          job={job}
          offset={index + 1}
          align={index % 2 === 0 ? 'left' : 'right'}
          scrollState={scrollState}
        />
      ))}

      {/* Background environment plane */}
      <mesh position={[0, -50, -2]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0f0f1e" />
      </mesh>
    </>
  );
}
