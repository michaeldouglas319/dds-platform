/**
 * Curved Takeoff Orbit - V3 Production
 *
 * Production orbital particle system using Rapier physics, blue gates, and purple waypoints.
 * Legacy V1/V2 implementations archived.
 */

'use client';

import { useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// V3 Only
import { CurvedTakeoffOrbitV3 } from './v3/CurvedTakeoffOrbitV3';
import { V3_CONFIG } from './v3/config/v3.config';
import { V3ConfigEditorSchemaDriven } from './v3/components/V3ConfigEditorSchemaDriven';

// Loaders
import { DynamicLoader } from '@/app/landing/components/DynamicLoader';
import { LoaderConfigEditor } from './components/LoaderConfigEditor';
import { DEFAULT_LOADER_CONFIG, type LoaderConfig } from './config/loader.schema';

// Shared
import { OrbitErrorBoundary } from './components/OrbitErrorBoundary';
import { PerformanceMonitor } from './components/PerformanceMonitor';

// ============================================================================
// LOADING FALLBACK
// ============================================================================

function SceneLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="text-center">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>

        <h2 className="text-xl font-semibold text-slate-300 mb-2">Loading V3 Scene</h2>
        <p className="text-sm text-slate-500">Initializing Rapier physics orbital system...</p>

        <div className="mt-6 space-y-2 text-xs text-slate-600">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span>Loading Rapier physics engine</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse animation-delay-200"></div>
            <span>Initializing blue gates & purple waypoints</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse animation-delay-400"></div>
            <span>Setting up GPU instanced particles</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function CurvedTakeoffOrbitPage() {
  const [config, setConfig] = useState(V3_CONFIG);
  const [loaderConfig, setLoaderConfig] = useState<LoaderConfig>(DEFAULT_LOADER_CONFIG);

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

            {/* Explicit Scene Lighting - Can be overridden via CSS or context */}
            {/* Ambient: Baseline fill light */}
            <ambientLight intensity={0.4} name="scene-ambient" />

            {/* Directional: Main sun-like light with shadows */}
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
              name="scene-directional"
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

            {/* V3 Scene */}
            <CurvedTakeoffOrbitV3 config={config} />

            {/* Center loader for testing lighting effects */}
            {loaderConfig.visible && (
              <group position={[0, loaderConfig.positionY, 0]} scale={loaderConfig.scale}>
                <DynamicLoader
                  type={loaderConfig.loaderType}
                  lightResponsive={loaderConfig.lightResponsive}
                />
              </group>
            )}
          </Canvas>
        </Suspense>
      </OrbitErrorBoundary>

      {/* Configuration Editor Overlay - Schema-Driven */}
      <V3ConfigEditorSchemaDriven config={config} onConfigChange={setConfig} />

      {/* Loader Configuration Editor */}
      <LoaderConfigEditor config={loaderConfig} onConfigChange={setLoaderConfig} />

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-20 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700 max-w-xs">
        <h3 className="text-white font-semibold text-sm mb-2">Controls</h3>
        <div className="text-xs text-slate-300 space-y-1">
          <div>• <strong>Left Click + Drag:</strong> Rotate camera</div>
          <div>• <strong>Right Click + Drag:</strong> Pan camera</div>
          <div>• <strong>Scroll:</strong> Zoom in/out</div>
          <div>• <strong>Config Editor:</strong> Edit parameters in real-time</div>
          <div>• <strong>Presets:</strong> 5 configurations available in editor</div>
        </div>
      </div>
    </div>
  );
}
