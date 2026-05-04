'use client';

import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CurvedTakeoffOrbit } from './CurvedTakeoffOrbit';
import { MULTI_SOURCE_ORBIT_CONFIG } from './config/multi-source.config';
import { CurvedTakeoffConfigEditor } from './components/CurvedTakeoffConfigEditor';
import { validateOrbitConfig } from './config/validation';
import { OrbitErrorBoundary } from './components/OrbitErrorBoundary';
import { PerformanceMonitor } from './components/PerformanceMonitor';

/**
 * Loading fallback for 3D scene
 */
function SceneLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="text-center">
        {/* Animated loading spinner */}
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>

        {/* Loading text */}
        <h2 className="text-xl font-semibold text-slate-300 mb-2">Loading 3D Scene</h2>
        <p className="text-sm text-slate-500">Initializing orbital system...</p>

        {/* Loading stages */}
        <div className="mt-6 space-y-2 text-xs text-slate-600">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span>Loading 3D models</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse animation-delay-200"></div>
            <span>Initializing physics system</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse animation-delay-400"></div>
            <span>Setting up particle system</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Error display component for configuration validation failures
 */
function ConfigErrorDisplay({ errors }: { errors: string[] }) {
  return (
    <div className="w-full h-screen bg-slate-950 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-6 bg-red-950/20 border-2 border-red-500 rounded-lg">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Configuration Error</h2>
        <p className="text-slate-300 mb-4">
          The orbital system configuration is invalid. Please fix the following errors:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-red-300 font-mono">
          {errors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
        <p className="text-slate-400 text-sm mt-4">
          Check <code className="bg-slate-800 px-2 py-1 rounded">config/multi-source.config.ts</code> for configuration issues.
        </p>
      </div>
    </div>
  );
}

export default function CurvedTakeoffOrbitPage() {
  const [configErrors, setConfigErrors] = useState<string[] | null>(null);

  // Validate configuration on mount
  useEffect(() => {
    const validationResult = validateOrbitConfig(MULTI_SOURCE_ORBIT_CONFIG);
    if (!validationResult.success) {
      console.error('❌ Orbit config validation failed:', validationResult.errors);
      setConfigErrors(validationResult.errors || ['Unknown validation error']);
    } else {
      console.log('✅ Orbit config validation passed');
    }
  }, []);

  // Show error screen if validation failed
  if (configErrors) {
    return <ConfigErrorDisplay errors={configErrors} />;
  }

  const [config, setConfig] = useState(() => ({
    orbit: {
      center: MULTI_SOURCE_ORBIT_CONFIG.orbit.center.clone(),
      radius: MULTI_SOURCE_ORBIT_CONFIG.orbit.radius,
      nominalSpeed: MULTI_SOURCE_ORBIT_CONFIG.orbit.nominalSpeed,
    },
    sources: MULTI_SOURCE_ORBIT_CONFIG.sources.map(source => ({
      ...source,
      gatePosition: source.gatePosition.clone(),
      takeoffWaypoints: source.takeoffWaypoints.map(w => w.clone()),
    })),
    particleCount: MULTI_SOURCE_ORBIT_CONFIG.particleCount,
    avoidance: { ...MULTI_SOURCE_ORBIT_CONFIG.avoidance },
    orbitDuration: MULTI_SOURCE_ORBIT_CONFIG.orbitDuration,
    landingDuration: MULTI_SOURCE_ORBIT_CONFIG.landingDuration,
    landingWaypoints: MULTI_SOURCE_ORBIT_CONFIG.landingWaypoints.map(w => w.clone()),
    landingTransitionTolerance: MULTI_SOURCE_ORBIT_CONFIG.landingTransitionTolerance,
    exitZone: MULTI_SOURCE_ORBIT_CONFIG.exitZone ? { ...MULTI_SOURCE_ORBIT_CONFIG.exitZone } : {
      radius: 4.0,
      attractionStrength: 0.15,
      attractionMaxDistance: 15.0,
      requireProximity: true,
    },
    defaultStartPhase: MULTI_SOURCE_ORBIT_CONFIG.defaultStartPhase,
    orbitHeightVariation: MULTI_SOURCE_ORBIT_CONFIG.orbitHeightVariation,
    orbitWaveFrequency: MULTI_SOURCE_ORBIT_CONFIG.orbitWaveFrequency,
  }));

  return (
    <div className="w-full h-screen bg-slate-950 relative overflow-hidden">
      {/* 3D Scene with Error Boundary and Loading State */}
      <OrbitErrorBoundary>
        <Suspense fallback={<SceneLoadingFallback />}>
          <Canvas
            camera={{
              position: [50, 40, 50],
              fov: 60,
              near: 0.1,
              far: 1000,
            }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance',
            }}
          >
            <color attach="background" args={['#0f172a']} />

            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[50, 50, 25]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={200}
              shadow-camera-left={-50}
              shadow-camera-right={50}
              shadow-camera-top={50}
              shadow-camera-bottom={-50}
            />

            {/* Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={10}
              maxDistance={200}
              target={[0, 15, 0]}
            />

            {/* Performance Monitor */}
            <PerformanceMonitor />

            {/* Main Component */}
            <CurvedTakeoffOrbit config={config as any} />
          </Canvas>
        </Suspense>
      </OrbitErrorBoundary>

      {/* Configuration Editor Overlay */}
      <CurvedTakeoffConfigEditor
        config={config as any}
        onConfigChange={setConfig as any}
      />

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-20 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700 max-w-xs">
        <h3 className="text-white font-semibold text-sm mb-2">Controls</h3>
        <div className="text-xs text-slate-300 space-y-1">
          <div>• <strong>Left Click + Drag:</strong> Rotate camera</div>
          <div>• <strong>Right Click + Drag:</strong> Pan camera</div>
          <div>• <strong>Scroll:</strong> Zoom in/out</div>
          <div>• <strong>Config Editor:</strong> Edit parameters in real-time</div>
        </div>
      </div>
    </div>
  );
}
