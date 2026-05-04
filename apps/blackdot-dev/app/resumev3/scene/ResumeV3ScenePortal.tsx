"use client"

import { NeuralNetworkScene } from './components/NeuralNetworkScene';

/**
 * ResumeV3ScenePortal - Portal-compatible version for overview cards
 * Simplified version optimized for portal rendering
 */
export function ResumeV3ScenePortal() {
  return (
    <NeuralNetworkScene 
      particleCountMultiplier={0.6} // Reduced for portal performance
      showContactShadows={false} // Disabled to avoid clipping nodes
    />
  );
}

