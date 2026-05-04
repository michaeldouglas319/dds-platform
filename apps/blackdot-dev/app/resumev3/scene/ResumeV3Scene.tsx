"use client"

import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { NeuralNetworkScene } from './components/NeuralNetworkScene';

interface ResumeV3SceneProps {
  selectedIndex?: number;
  onProjectClick?: (index: number) => void;
}

/**
 * Resume V3 Scene Component
 * Hybrid approach: 3D scene with shadcn overlays
 * Uses the same neural network as landing page for background
 * Showcases advanced R3F techniques: neural networks, physics, portals
 */
export function ResumeV3Scene({ selectedIndex = 0, onProjectClick }: ResumeV3SceneProps) {
  const { previousRoot } = useThree();
  const isPortal = !!previousRoot;

  return (
    <>
      <NeuralNetworkScene 
        particleCountMultiplier={1} // Full particle count for detail view
        showContactShadows={true} // Enabled for detail view
      />
      
      {/* Optional: Orbit controls for exploration (disabled in portal) */}
      {!isPortal && (
        <OrbitControls 
          enableDamping
          dampingFactor={0.05}
          minDistance={0.5}
          maxDistance={3}
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
        />
      )}
    </>
  );
}

