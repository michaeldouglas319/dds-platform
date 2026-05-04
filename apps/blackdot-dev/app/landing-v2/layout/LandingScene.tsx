'use client'

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { SceneErrorBoundary } from '@/components/SceneErrorBoundary';
import { NetworkRef } from '../types/network.types';
import { getElementWorldPosition } from '../utils/screenToWorld';
import { CurvedTakeoffOrbitV3 } from '@/app/(protected-admin)/curved-takeoff-orbit/v3/CurvedTakeoffOrbitV3';
import { V3_CONFIG } from '@/app/(protected-admin)/curved-takeoff-orbit/v3/config/v3.config';
import { DynamicLoader } from '../components/DynamicLoader';
import { type LoaderType } from '../config/display.config';
import { mergeV3Config } from '@/app/(protected-admin)/curved-takeoff-orbit/v3/lib/config-merge';
// postprocessing disabled (R3F v8 compat) — re-enable when upgrading to R3F v9+React 19
const EffectComposer = ({ children }: { children?: React.ReactNode }) => <>{children}</>
const Bloom = (_: Record<string, unknown>) => null
const HueSaturation = (_: Record<string, unknown>) => null
const BrightnessContrast = (_: Record<string, unknown>) => null
import { LoaderLayout } from '@/components/loaders/LoaderLayout';
import { ProfileImageDisk } from '../components/ProfileImageDisk';
import { InteractiveSphere } from '../components/InteractiveSphere';
import { InteractiveModel } from '../components/InteractiveModel';
import { LOW_POLY_GEOMETRY_SETS, createGeometryFromType } from '@/lib/threejs/utils/simplifyGeometry';
import { Navigation3DButtonGrid } from '@/components/three/Navigation3DButtonGrid';
import { useAuth } from '@/lib/contexts/AuthContext';
import { AccessLevel, AccessLevelWeight } from '@/lib/types/auth.types';
import { useFeaturedRoutes } from '@/lib/hooks/useFeaturedRoutes';
import { usePathname, useRouter } from 'next/navigation';
import { getIconForRoute } from '@/lib/utils/route-icons';

// Canvas-safe feature gate component (no HTML elements)
function GatedNavigation3D() {
  const { accessLevel } = useAuth();
  const hasAccess = AccessLevelWeight[accessLevel] >= AccessLevelWeight[AccessLevel.MEMBER];

  if (!hasAccess) {
    return null;
  }
  
  return (
    <Navigation3DButtonGrid
      buttons={[
        { id: 'home', label: 'Home', path: '/', color: '#3b82f6' },
        { id: 'resume', label: 'Resume', path: '/resumev3', color: '#8b5cf6' },
        { id: 'ideas', label: 'Ideas', path: '/ideas', color: '#06b6d4' },
        { id: 'about', label: 'About', path: '/about', color: '#ec4899' },
      ]}
      position={[0, -5, 0]}
      spacing={2}
    />
  );
}

// Component to access Three.js context for projection
function TextToNodeHandler({ 
  networkRef, 
  onMorphComplete 
}: { 
  networkRef: React.RefObject<NetworkRef>;
  onMorphComplete?: (word: string) => void;
}) {
  const { camera, gl } = useThree();
  
  const handleMorph = useCallback((word: string, elementRef?: HTMLElement) => {
    if (!networkRef.current) return;
    
    let position: THREE.Vector3;
    
    if (elementRef && gl.domElement) {
      // Project text position to 3D world space
      try {
        position = getElementWorldPosition(elementRef, camera, gl.domElement, 0.3);
      } catch (error) {
        console.warn('Failed to project text position, using random:', error);
        // Fallback to random position
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
      // Fallback to random position if element ref not available
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
    // Call parent callback only (no recursion)
    onMorphComplete?.(word);
  }, [networkRef, camera, gl, onMorphComplete]);
  
  // Store handler globally so it can be accessed from outside Canvas
  useEffect(() => {
    (window as Window & { __handleTextMorph?: (word: string, elementRef?: HTMLElement) => void }).__handleTextMorph = handleMorph;
    return () => {
      delete (window as Window & { __handleTextMorph?: (word: string, elementRef?: HTMLElement) => void }).__handleTextMorph;
    };
  }, [handleMorph]);
  
  return null;
}

interface LandingScene3DProps {
  networkRef: React.RefObject<NetworkRef>;
  onMorphComplete?: (word: string) => void;
  cameraPos: [number, number, number];
  cameraFov?: number;
  backgroundColor: string;
  ambientIntensity: number;
  directionalIntensity: number;
  debugScale: number;
  currentLoader: LoaderType;
  loaderScale: number;
  loaderPosition: [number, number, number];
  loaderRotation: [number, number, number];
  loaderLightResponsive: boolean;
  bloomIntensity: number;
  saturation: number;
  brightness: number;
  // Item10 customization parameters
  item10OuterRadius?: number;
  item10InnerRadius?: number;
  item10Depth?: number;
  item10Segments?: number;
  // Profile image controls
  profileImageScale?: number;
  profileImagePosition?: [number, number, number];
  profileImageMetalness?: number;
  profileImageRoughness?: number;
  profileImageGlow?: number;
}

export function LandingScene3D({
  networkRef,
  onMorphComplete,
  cameraPos,
  cameraFov = 50,
  backgroundColor,
  ambientIntensity,
  directionalIntensity,
  debugScale,
  currentLoader,
  loaderScale,
  loaderPosition,
  loaderRotation,
  loaderLightResponsive,
  bloomIntensity,
  saturation,
  brightness,
  item10OuterRadius = .45,
  item10InnerRadius = 0.2,
  item10Depth = 0.3,
  item10Segments = 4,
  profileImageScale: _profileImageScale = 0.75,
  profileImagePosition: _profileImagePosition = [0, 0, 0.1],
  profileImageMetalness: _profileImageMetalness = 0.4,
  profileImageRoughness: _profileImageRoughness = 0.3,
  profileImageGlow: _profileImageGlow = 0.2,
}: LandingScene3DProps) {

  const router = useRouter();
  const pathname = usePathname();
  const { featuredRoutes, loading } = useFeaturedRoutes();
  const { accessLevel } = useAuth();

  // Canvas dpr state (for hydration safety)
  const [dpr, setDpr] = useState<[number, number]>([1, 1]);

  // Set canvas dpr after hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const actualDPR = Math.min(window.devicePixelRatio, 1.5);
    setDpr([1, actualDPR]);
  }, []);

  const navigationSections = useMemo(() => {
    if (loading || !featuredRoutes.length) {
      return [];
    }

    return featuredRoutes.map((route) => {
      const Icon = getIconForRoute(route.path);
      return {
        id: route.id,
        name: route.label,
        path: route.path,
        icon: Icon,
      };
    });
  }, [featuredRoutes, loading]);

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

          // Memory management: dispose resources on unmount
          const cleanup = () => {
            try {
              // Dispose geometries
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

              // Clear renderer
              gl.dispose();
              gl.forceContextLoss();
            } catch (error) {
              console.warn('Error during cleanup:', error);
            }
          };

          const handleContextLost = (event: Event) => {
            event.preventDefault();
            console.warn('WebGL context lost - GPU memory exhausted. Attempting recovery...');

            // Clear texture cache
            try {
              // Get WebGL context from renderer
              const context = gl.getContext();
              if (context) {
                const maxTextures = context.getParameter(context.MAX_TEXTURE_IMAGE_UNITS) as number;
                for (let i = 0; i < maxTextures; i++) {
                  context.activeTexture(context.TEXTURE0 + i);
                  context.bindTexture(context.TEXTURE_2D, null);
                }
              }

              // Clear render targets - type assert to access internal Three.js property
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
            // console.log('WebGL context restored. Reloading page to reset state...');
            // Small delay to ensure context is fully restored
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          };

          canvas.addEventListener('webglcontextlost', handleContextLost);
          canvas.addEventListener('webglcontextrestored', handleContextRestored);

          // Cleanup on unmount
          return () => {
            cleanup();
            canvas.removeEventListener('webglcontextlost', handleContextLost);
            canvas.removeEventListener('webglcontextrestored', handleContextRestored);
          };
        }}
      >
        <color attach="background" args={[backgroundColor]} />

        {/* Explicit Scene Lighting - Landing uses zero ambient by default to showcase particle lights */}
        {/* Ambient: Minimal fill (can be increased for softer look) */}
        <ambientLight intensity={ambientIntensity} name="scene-ambient" />

        {/* Directional: Subtle scene light (optional, can be disabled) */}
        <directionalLight
          position={[50, 50, 25]}
          intensity={directionalIntensity}
          castShadow={true}
          name="scene-directional"
        />

        <OrbitControls makeDefault />

        {/* Cycling loader based on config intervals */}
        <group position={loaderPosition} scale={2.5} rotation={loaderRotation}>
          {/* <DynamicLoader type={currentLoader} lightResponsive={loaderLightResponsive} /> */}
          <LoaderLayout
            loader="item10"
            onClick={() => router.push(navigationSections.find((section) => section.path
              === '/')?.path || '/')}       
            variant="circular"
            position={[0, 2.1, 0]}
            title={{
              content: "Welcome",
              fontSize: .4,
              color: "#9ca3af"
            }}
            subtitle={{
              content: "Welcome to Show",
              fontSize: 0.2,
              color: "#9ca3af"
            }}
            item10OuterRadius={.64}
            item10InnerRadius={0.6}
            item10Depth={0.02}
            item10Segments={item10Segments}
            lightResponsive={loaderLightResponsive}
          >
            <ProfileImageDisk
              scale={1}
              position={[0, -.02, 0.1]}
              metalness={0.0}
              roughness={0.3}
              emissive={0.01}
              
            />
          </LoaderLayout>
          <LoaderLayout
          clickable={true} 
            loader="item5"
            onClick={() => router.push(navigationSections.find((section) => section.path
              === '/ideas')?.path || '/ideas')}    
            position={[0, -2, 0]}
            scale={0.25}
            variant="circular"
            title={{
              content: "Ideas",
              fontSize: 1,
              color: "#9ca3af"
            }}
            subtitle={ AccessLevelWeight[accessLevel] >= AccessLevelWeight[AccessLevel.MEMBER] ?  {
              content: "This may take a few seconds",
              fontSize: 0.2,
              color: "#9ca3af"
            } : undefined}
            statusText={{ content: "MD", color: "#ffffff" }}
            lightResponsive={loaderLightResponsive}
          >
            <ProfileImageDisk
              scale={0.35}
              position={[0, 0.0, 0.2]}
              metalness={0.0}
              roughness={0.3}
              emissive={0.01}
              
            />
          </LoaderLayout>
        </group>

        <CurvedTakeoffOrbitV3
          config={mergeV3Config(V3_CONFIG, {
            display: {
              particleCount: V3_CONFIG.particleCount,
              particleMode: V3_CONFIG.display.particleMode,
              showModels: V3_CONFIG.display.showModels,
              showStaticObjects: V3_CONFIG.display.showStaticObjects,
              hybridGlow: {
                mainLightCount: V3_CONFIG.particleCount,
                mainLightPower: 0,
                mainLightDistance: 0,
                bloomIntensity: 0.01,
                bloomThreshold: 0.5,
                particleEmissive: 0.8,
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

        {/* 3D Navigation Button Grid - Member Only */}
        {/* <GatedNavigation3D /> */}
       

        {/* Text morphing handler for particle integration */}
        <TextToNodeHandler
          networkRef={networkRef}
          onMorphComplete={onMorphComplete}
        />

        {/* Post-Processing Effects */}
        <EffectComposer>
          <Bloom intensity={bloomIntensity} luminanceThreshold={0.5} />
          <HueSaturation saturation={saturation - 1} />
          <BrightnessContrast brightness={brightness - 1} contrast={0} />
        </EffectComposer>
      </Canvas>
    </SceneErrorBoundary>
  );
}

