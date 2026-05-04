'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SimpleDemo } from './SimpleDemo';

export default function PathOrbitPage() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [70, 50, 70], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={2} />
        <directionalLight position={[40, 40, 40]} intensity={2} castShadow />

        {/* Demo */}
        <SimpleDemo />

        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={30}
          maxDistance={300}
          target={[20, 20, 20]}
        />
      </Canvas>

      {/* Title */}
      <div className="fixed top-4 left-4 text-white text-sm">
        <h1 className="font-bold mb-1">Path → Orbit</h1>
        <p className="text-gray-400">Particles follow path, then orbit</p>
      </div>
    </div>
  );
}
