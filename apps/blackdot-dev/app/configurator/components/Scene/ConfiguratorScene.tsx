'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { ReactNode, Suspense } from 'react';
import { Color } from 'three';
import { Lighting } from './Lighting';
import { EnvironmentBackground } from './Environment';
import { useAdaptiveResolution } from '@/lib/utils/resolutionOptimization';

interface ConfiguratorSceneProps {
  children?: ReactNode;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  enableOrbitControls?: boolean;
  environment?: 'studio' | 'sunset' | 'warehouse' | 'custom' | 'none';
  lightingTheme?: 'studio' | 'sunset' | 'warehouse' | 'minimal';
  showGrid?: boolean;
  backgroundColor?: string;
  environmentIntensity?: number;
  lightingIntensity?: number;
  onCameraChange?: (position: [number, number, number]) => void;
  onSceneReady?: () => void;
}

/**
 * Main configurator 3D scene component
 * Orchestrates lighting, environment, camera, and orbit controls
 *
 * @category 3d
 * @subcategory scene
 */
export function ConfiguratorScene({
  children,
  cameraPosition = [5, 4, 5],
  cameraFov = 50,
  enableOrbitControls = true,
  environment = 'studio',
  lightingTheme = 'studio',
  showGrid = false,
  backgroundColor = '#0a0a0a',
  environmentIntensity = 1.5,
  lightingIntensity = 1,
  onCameraChange,
  onSceneReady,
}: ConfiguratorSceneProps) {
  const { settings } = useAdaptiveResolution();

  return (
    <Canvas
      gl={{
        antialias: settings.antialias,
        powerPreference: settings.powerPreference,
      }}
      dpr={settings.dpr}
      frameloop={settings.frameloop}
      onCreated={() => onSceneReady?.()}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Scene background */}
      <color attach="background" args={[new Color(backgroundColor)]} />

      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={cameraPosition}
        fov={cameraFov}
        near={0.1}
        far={1000}
      />

      {/* Lighting system */}
      <Lighting intensity={lightingIntensity} theme={lightingTheme} />

      {/* Environment HDRI */}
      {environment !== 'none' && (
        <EnvironmentBackground
          type={environment}
          intensity={environmentIntensity}
          blur={0.65}
        />
      )}

      {/* Orbit controls */}
      {enableOrbitControls && (
        <OrbitControls
          makeDefault
          autoRotate={false}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={100}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          dampingFactor={0.05}
          enableDamping
          onChange={(e) => {
            if (onCameraChange && e?.target) {
              const pos = (e.target as any).position;
              onCameraChange([pos.x, pos.y, pos.z]);
            }
          }}
        />
      )}

      {/* Grid helper (optional) */}
      {showGrid && (
        <Grid
          args={[20, 20]}
          cellColor="#444444"
          sectionColor="#888888"
          fadeDistance={50}
          fadeStrength={0.5}
          infiniteGrid
        />
      )}

      {/* Scene content */}
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
