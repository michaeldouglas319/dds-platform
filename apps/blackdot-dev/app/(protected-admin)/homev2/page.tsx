'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { HomeV2Scene } from './scene/HomeV2Scene';
import { ParticleSystemControls } from './components/ParticleSystemControls';
import { ModelParameterModal } from './components/ModelParameterModal';
// Isolated particle system - using its own defaults
const DEFAULT_PARTICLE_SCALE = 100;
const DEFAULT_PARTICLE_POSITION: [number, number, number] = [5, 50, 0];
const DEFAULT_ORIGIN_ROTATION: [number, number, number] = [0, 0, 0];

export default function HomeV2Page() {
  const [particleScale, setParticleScale] = useState(DEFAULT_PARTICLE_SCALE);
  const [particlePosition, setParticlePosition] = useState<[number, number, number]>(
    DEFAULT_PARTICLE_POSITION
  );
  const [originRotation, setOriginRotation] = useState<[number, number, number]>(
    DEFAULT_ORIGIN_ROTATION
  );
  const [modelModalOpen, setModelModalOpen] = useState(false);

  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas
        camera={{ position: [5, 30, 40], fov: 60 }}
        shadows
        gl={{ antialias: true }}
        onCreated={({ camera }) => {
          camera.lookAt(5, 0, 0); // Look at scene center (between gates and runway)
        }}
      >
        <HomeV2Scene
          particleScale={particleScale}
          particlePosition={particlePosition}
          originRotation={originRotation}
        />
      </Canvas>
      
      {/* Control Panel */}
      <ParticleSystemControls
        scale={particleScale}
        position={particlePosition}
        originRotation={originRotation}
        onScaleChange={setParticleScale}
        onPositionChange={setParticlePosition}
        onOriginRotationChange={setOriginRotation}
        onReset={() => {
          setParticleScale(DEFAULT_PARTICLE_SCALE);
          setParticlePosition(DEFAULT_PARTICLE_POSITION);
          setOriginRotation(DEFAULT_ORIGIN_ROTATION);
        }}
        onOpenModelModal={() => setModelModalOpen(true)}
      />
      
      {/* Model Parameter Modal */}
      <ModelParameterModal open={modelModalOpen} onOpenChange={setModelModalOpen} />
    </div>
  );
}
