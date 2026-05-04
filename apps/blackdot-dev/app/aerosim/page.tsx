'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the particle simulator component with no SSR
const AeroSimScene = dynamic(
  () => import('./components/ParticleSimulatorScene').then(mod => mod.ParticleSimulatorScene),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen text-foreground">Loading AeroSim...</div>
  }
);

export default function Page() {
  return (
    <div className="w-full h-screen overflow-hidden bg-background">
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-foreground">Loading...</div>}>
        <AeroSimScene />
      </Suspense>
    </div>
  );
}
