'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Dynamically import the particle simulator component with no SSR
const ParticleSimulatorScene = dynamic(
  () => import('../components/ParticleSimulatorScene').then(mod => mod.ParticleSimulatorScene),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen text-foreground">Loading Particle Simulator...</div>
  }
);

export default function ParticleSimulatorModelPage() {
  const params = useParams();
  const router = useRouter();
  const modelName = params?.model as string;

  // Redirect to main page with search params
  useEffect(() => {
    if (modelName) {
      const searchParams = new URLSearchParams();
      searchParams.set('model', modelName);
      router.replace(`/particle-simulator?${searchParams.toString()}`);
    }
  }, [modelName, router]);

  return (
    <div className="w-full h-screen overflow-hidden bg-background">
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-foreground">Loading...</div>}>
        <ParticleSimulatorScene />
      </Suspense>
    </div>
  );
}


