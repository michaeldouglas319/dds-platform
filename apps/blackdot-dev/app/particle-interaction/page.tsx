'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { LeapParticleScene, ParticleControls } from './components';
import { Suspense, useState } from 'react';
import * as THREE from 'three';

export default function ParticleInteractionPage() {
  const [particleCount, setParticleCount] = useState(65536); // 65K default
  const [handBounceRatio, setHandBounceRatio] = useState(0.1);
  const [handForce, setHandForce] = useState(0.015);
  const [gravity, setGravity] = useState(10);

  return (
    <div className="w-full h-screen flex flex-col bg-black relative">
      {/* Canvas */}
      <Canvas
        className="w-full h-full"
        camera={{ position: [0, 300, 500], fov: 45, near: 1, far: 3000 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        shadows
      >
        <color attach="background" args={['#000000']} />

        {/* Lighting for shadow mapping */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[50, 100, 50]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={500}
          shadow-camera-left={-200}
          shadow-camera-right={200}
          shadow-camera-top={200}
          shadow-camera-bottom={-200}
        />

        {/* Original touch-leap-motion particle system */}
        <Suspense fallback={null}>
          <LeapParticleScene
            particleCount={particleCount}
            handBounceRatio={handBounceRatio}
            handForce={handForce}
            gravity={gravity}
          />
        </Suspense>

        {/* Camera controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          autoRotate={false}
        />

        {/* Performance stats */}
        <Stats />
      </Canvas>

      {/* Title overlay */}
      <div className="absolute top-4 left-4 z-20">
        <h1 className="text-2xl font-bold text-white mb-1">
          TOUCH - Original Leap Motion Particles
        </h1>
        <p className="text-sm text-slate-400">
          Original touch-leap-motion particle system with ground collision, reset logic, and shadow mapping
        </p>
        <p className="text-xs text-slate-500 mt-2">
          🖱️ Move mouse = control hand • 🖱️ Click + hold = grip particles • 🔄 Right-click + drag = orbit camera
        </p>
      </div>

      {/* Controls sidebar */}
      <ParticleControls
        particleCount={particleCount}
        setParticleCount={setParticleCount}
        handBounceRatio={handBounceRatio}
        setHandBounceRatio={setHandBounceRatio}
        handForce={handForce}
        setHandForce={setHandForce}
        gravity={gravity}
        setGravity={setGravity}
      />
    </div>
  );
}
