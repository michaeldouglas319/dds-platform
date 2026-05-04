'use client'

import { useCallback, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CameraControls, Environment, Stars } from '@react-three/drei';
import { SceneErrorBoundary } from '@/components/SceneErrorBoundary';
import { NetworkRef } from '../types/network.types';
import { getElementWorldPosition } from '../utils/screenToWorld';
import { CurvedTakeoffOrbitV3 } from '@/app/(protected-admin)/curved-takeoff-orbit/v3/CurvedTakeoffOrbitV3';
import { V3_CONFIG } from '@/app/(protected-admin)/curved-takeoff-orbit/v3/config/v3.config';
import { mergeV3Config } from '@/app/(protected-admin)/curved-takeoff-orbit/v3/lib/config-merge';
import { GlassSphereCluster } from '@/components/three/GlassSphereCluster';
import { NavigationDock } from '@/components/three/NavigationDock';
import { Navigation3DMinimal } from '@/components/three/Navigation3DMinimal';
import { ParticleGlassInteraction } from '@/components/three/ParticleGlassInteraction';
import { Ground } from '@/components/three/Ground';
import { SignIn3DForm } from '@/components/three/SignIn3DForm';
import { Profile3D } from '@/components/three/Profile3D';
import { getGlassSphereLayout, getLayoutPresetForBreakpoint } from '../config/glass-spheres.config';
import { getNavigationConfig, getBreakpointFromWidth } from '../config/navigation.config';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Resume3D } from '@/components/three/Resume3D';

interface LandingScene3DProps {
  networkRef: React.RefObject<NetworkRef>;
  onMorphComplete?: (word: string) => void;
  cameraPos: [number, number, number];
  cameraFov?: number;
  backgroundColor: string;
  ambientIntensity: number;
  directionalIntensity: number;
  debugScale: number;
  bloomIntensity: number;
  saturation: number;
  brightness: number;
}

// Component to render SignIn3DForm with Profile conditionally with auth check
function SignInFormHandler() {
  const { isAuthenticated } = useAuth();

  // Only show sign-in form if user is NOT authenticated
  if (isAuthenticated) return null;

  return (
    <group>
      {/* Profile above SignIn */}
      <Profile3D position={[0, 2, 0]} scale={1.4} />
      <Resume3D position={[0,0, 0]} scale={1.4} />
      {/* SignIn form below profile */}
      <SignIn3DForm position={[0, -2, 0]} scale={1.5} />
    </group>
  );
}

// Component to access Three.js context for projection
function TextToNodeHandler({
  networkRef,
  onMorphComplete,
}: {
  networkRef: React.RefObject<NetworkRef>;
  onMorphComplete?: (word: string) => void;
}) {
  const { camera, gl } = useThree();

  const handleMorph = useCallback(
    (word: string, elementRef?: HTMLElement) => {
      if (!networkRef.current) return;

      let position: THREE.Vector3;

      if (elementRef && gl.domElement) {
        try {
          position = getElementWorldPosition(elementRef, camera, gl.domElement, 0.3);
        } catch (error) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 0.5 + Math.random() * 0.3;
          const height = -0.09 + (Math.random() - 0.5) * 0.2;
          position = new THREE.Vector3(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
          );
        }
      } else {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.5 + Math.random() * 0.3;
        const height = -0.09 + (Math.random() - 0.5) * 0.2;
        position = new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
      }

      networkRef.current.integrateParticle(position, 0);
      onMorphComplete?.(word);
    },
    [networkRef, camera, gl, onMorphComplete]
  );

  useEffect(() => {
    (window as Window & { __handleTextMorph?: (word: string, elementRef?: HTMLElement) => void }).__handleTextMorph =
      handleMorph;
    return () => {
      delete (window as Window & { __handleTextMorph?: (word: string, elementRef?: HTMLElement) => void }).__handleTextMorph;
    };
  }, [handleMorph]);

  return null;
}

export function LandingScene3D({
  networkRef,
  onMorphComplete,
  cameraPos,
  cameraFov = 30,
  backgroundColor,
  ambientIntensity,
  directionalIntensity,
  debugScale,
  bloomIntensity,
  saturation,
  brightness,
}: LandingScene3DProps) {
  const layoutPreset = getLayoutPresetForBreakpoint('desktop');
  const glassSphereLayout = getGlassSphereLayout(layoutPreset);
  const navConfig = getNavigationConfig('desktop');

  // Canvas dpr state (for hydration safety)
  const [dpr, setDpr] = useState<[number, number]>([1, 1]);

  // Set canvas dpr after hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const actualDPR = Math.min(window.devicePixelRatio, 1.5);
    setDpr([1, actualDPR]);
  }, []);

  return (
    <SceneErrorBoundary>
      <Canvas
        shadows
        dpr={dpr}
        camera={{ position: cameraPos, fov: cameraFov }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
          alpha: true,
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl, scene }) => {
          const canvas = gl.domElement;

          const cleanup = () => {
            try {
              scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                  if (object.geometry) object.geometry.dispose();
                  if (object.material) {
                    if (Array.isArray(object.material)) {
                      object.material.forEach((mat) => {
                        if (mat.map) mat.map.dispose();
                        if (mat.normalMap) mat.normalMap.dispose();
                        mat.dispose();
                      });
                    } else {
                      if (object.material.map) object.material.map.dispose();
                      if (object.material.normalMap) object.material.normalMap.dispose();
                      object.material.dispose();
                    }
                  }
                }
              });

              gl.dispose();
              gl.forceContextLoss();
            } catch (error) {
              console.warn('Error during cleanup:', error);
            }
          };

          const handleContextLost = (event: Event) => {
            event.preventDefault();
            console.warn('WebGL context lost - GPU memory exhausted. Attempting recovery...');

            try {
              const context = gl.getContext();
              if (context) {
                const maxTextures = context.getParameter(context.MAX_TEXTURE_IMAGE_UNITS) as number;
                for (let i = 0; i < maxTextures; i++) {
                  context.activeTexture(context.TEXTURE0 + i);
                  context.bindTexture(context.TEXTURE_2D, null);
                }
              }

              const internalGl = gl as unknown as { renderTargets?: Array<{ dispose: () => void }> };
              const renderTargets = internalGl.renderTargets || [];
              renderTargets.forEach((rt: { dispose: () => void }) => {
                if (rt.dispose) rt.dispose();
              });
            } catch (e) {
              console.warn('Could not clear GPU resources:', e);
            }
          };

          const handleContextRestored = () => {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          };

          canvas.addEventListener('webglcontextlost', handleContextLost);
          canvas.addEventListener('webglcontextrestored', handleContextRestored);

          return () => {
            cleanup();
            canvas.removeEventListener('webglcontextlost', handleContextLost);
            canvas.removeEventListener('webglcontextrestored', handleContextRestored);
          };
        }}
      >
        <color attach="background" args={[backgroundColor]} />
        <CameraControls
          makeDefault
          minAzimuthAngle={-0.05}
          maxAzimuthAngle={0.05}
          minPolarAngle={1.6}
          maxPolarAngle={1.6}
          minDistance={18}
          maxDistance={18}
        />
<Stars count={10000} speed={1} radius={1} factor={1} saturation={1} fade={true} />
        {/* Environment for reflections */}
        {/* <Environment preset="city" /> */}

        {/* Lighting */}
        <fog attach="fog" args={['black', 0,80]} />
        {/* <hemisphereLight intensity={0.25} color="#ffffff" groundColor="#4a5568" />
        <pointLight position={[5, 8, 5]} intensity={0.6} castShadow />
        <pointLight position={[-5, 8, -5]} intensity={0.4} /> */}

        {/* Ground */}
        {/* <Ground /> */}

        {/* Glass Sphere Cluster */}
        {/* <group scale={debugScale}>
          <GlassSphereCluster
            spheres={glassSphereLayout.spheres}
            centerPosition={[0, 0, 0]}
            groupRotationSpeed={glassSphereLayout.groupRotationSpeed}
            breakpoint="desktop"
          />
        </group> */}

        {/* Navigation Dock */}
        <NavigationDock
          position={navConfig.dockPosition}
          scale={1.0}
          layout={navConfig.layout as 'horizontal' | 'vertical'}
          spacing={navConfig.spacing}
          breakpoint="desktop"
        />

        {/* 3D Navigation Bar - Frosted Glass Effect */}
        <Navigation3DMinimal />

        {/* Sign In 3D Form - shown only when not authenticated */}
        <SignInFormHandler />

        {/* Particle-Sphere Interaction */}
        <ParticleGlassInteraction
          spherePositions={glassSphereLayout.spheres
            .slice(0, 3)
            .map((s) => s.localPosition)}
          detectionRadius={3}
          colorInfluence={0.25}
        />

        {/* Particles */}
        <CurvedTakeoffOrbitV3
          config={mergeV3Config(V3_CONFIG, {
            orbit: {
              center: new THREE.Vector3(0, 30, 0),
              radius: 10,
              nominalSpeed: 15.0,
            },
            physics: {
              orbitRadius: 15,
              donutThickness: 5,
              gravitationalConstant: 150,
              nominalOrbitSpeed: 15,
              particleMass: 1,
              collisionRadius: 0.001,
              dampingLinear: 0.1,
              dampingAngular: 0.1,
              tangentialBoost: 600,
              radialConfinement: 600,
              restitution: 0.5,
              friction: 0.01,
            },
            display: {
              particleCount: V3_CONFIG.particleCount,
              particleMode: V3_CONFIG.display.particleMode,
              showModels: V3_CONFIG.display.showModels,
              showStaticObjects: V3_CONFIG.display.showStaticObjects,
              hybridGlow: {
                mainLightCount: V3_CONFIG.particleCount,
                mainLightPower: 0,
                mainLightDistance: 0,
                bloomIntensity: 0.5,
                bloomThreshold: 0.5,
                particleEmissive: 0.7,
                bloomKernelSize: 3,
                bloomMipmapBlur: true,
              },
            },
          })}
          scale={debugScale}
          baseParticlesOnly={true}
          showStaticModels={false}
          showSourceModels={false}
          showGroundPlane={false}
        />

        {/* Text morphing */}
        <TextToNodeHandler networkRef={networkRef} onMorphComplete={onMorphComplete} />

        {/* Effects - Bloom is now unified in CurvedTakeoffOrbitV3 component */}
        {/* HueSaturation and BrightnessContrast moved to parent canvas if needed */}
      </Canvas>
    </SceneErrorBoundary>
  );
}
