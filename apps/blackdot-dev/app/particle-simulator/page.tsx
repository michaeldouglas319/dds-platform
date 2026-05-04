'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the particle simulator component with no SSR
const ParticleSimulatorScene = dynamic(
  () => import('./components/ParticleSimulatorScene').then(mod => mod.ParticleSimulatorScene),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen text-foreground">Loading Particle Simulator...</div>
  }
);

export default function ParticleSimulatorPage() {
  return (
    <div className="w-full h-screen overflow-hidden bg-background">
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-foreground">Loading...</div>}>
        <ParticleSimulatorScene />
      </Suspense>
    </div>
  );
}
