'use client';

import { Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { OrbitalCamera } from './components/OrbitalCamera';
import { OrbitContainer } from '../components/OrbitContainer';
import { OrbitCard } from '../components/OrbitCard';
import { CentralContent } from '../components/CentralContent';
import { resumeJobs } from '@/lib/config/content';
import type { OrbitalState } from '../hooks/useOrbitalState';

interface OrbitalResumeSceneProps {
  /** Orbital state from useOrbitalState hook */
  orbital: OrbitalState;
}

/**
 * OrbitalResumeScene Component
 * 3D scene for orbital carousel resume layout
 *
 * Architecture:
 * - OrbitalCamera: Fixed perspective camera looking at orbit center
 * - Lighting and environment setup
 * - OrbitContainer: Manages orbital positioning and rotation
 * - OrbitCard: Individual job cards in orbit
 * - CentralContent: Central panel showing selected job details
 *
 * Interaction:
 * - Click card to select and rotate to front
 * - Navigation buttons to advance/go back
 * - Auto-smooth rotation animation
 *
 * @example
 * <Canvas>
 *   <OrbitalResumeScene orbital={orbitalState} />
 * </Canvas>
 */
export function OrbitalResumeScene({ orbital }: OrbitalResumeSceneProps) {
  const selectedJob =
    orbital.selectedIndex >= 0 && orbital.selectedIndex < resumeJobs.length
      ? resumeJobs[orbital.selectedIndex]
      : null;

  return (
    <>
      {/* Fixed camera for orbital view */}
      <OrbitalCamera distance={40} height={8} zoom={60} />

      {/* Lighting setup */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} />
      <pointLight position={[-10, 8, 10]} intensity={0.4} color="#4f46e5" />

      {/* Optional: Environment for better lighting */}
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      {/* Orbital Carousel Container */}
      <OrbitContainer orbital={orbital} radius={20} orbitY={2} lerpAmount={0.12}>
        {resumeJobs.map((job, index) => (
          <OrbitCard
            key={job.id}
            job={job}
            index={index}
            orbitAngle={0} // Calculated by OrbitContainer
            orbitRadius={20}
            isSelected={index === orbital.selectedIndex}
            onSelect={() => orbital.selectCard(index)}
          />
        ))}
      </OrbitContainer>

      {/* Central Content Panel */}
      <CentralContent
        selectedJob={selectedJob}
        totalCards={resumeJobs.length}
        selectedIndex={orbital.selectedIndex}
        onNext={orbital.nextCard}
        onPrevious={orbital.previousCard}
      />

      {/* Background environment */}
      <mesh position={[0, -15, -30]}>
        <planeGeometry args={[120, 80]} />
        <meshStandardMaterial color="#0f0f1e" emissive="#0f0f1e" />
      </mesh>

      {/* Ambient glow effect - subtle sphere for atmosphere */}
      <mesh position={[0, 0, 0]} scale={50}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#1a1a3e"
          emissive="#2d2d5f"
          emissiveIntensity={0.15}
          transparent
          opacity={0.1}
          side={2}
        />
      </mesh>
    </>
  );
}
