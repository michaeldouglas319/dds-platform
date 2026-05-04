'use client';

import { Suspense, useMemo, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { BuildingModel, UAVModel, BookModel, FutureIslandModel } from '@/lib/scenes/models';
import { businessSections } from '../config/businessData.config';

interface BusinessOverviewSceneProps {
  currentSection: number;
  scrollProgress: number;
  modelOffset?: number;
}

/**
 * Business Section Renderer
 * Renders the appropriate model based on section index
 * Models cycle through: Building → UAV → Book → FutureIsland
 */
function BusinessSection({
  index,
  modelOffset = 0,
  color,
}: {
  index: number;
  modelOffset?: number;
  color: string;
}) {
  const colorObj = new THREE.Color(color || '#0066ff');
  const modelIndex = index % 4;

  const fallbackGeometry = [
    { type: 'box', args: [2, 2, 2] },
    { type: 'box', args: [1.5, 0.5, 1.5] },
    { type: 'box', args: [1, 1.5, 0.3] },
    { type: 'cone', args: [1, 2, 8] },
  ][modelIndex];

  return (
    <group>
      <Suspense
        fallback={
          <group>
            <mesh position={[modelOffset, 0, 0]}>
              {fallbackGeometry.type === 'box' && (
                <>
                  <boxGeometry args={fallbackGeometry.args as [number, number, number]} />
                  <meshStandardMaterial color={colorObj} metalness={0.8} roughness={0.2} />
                </>
              )}
              {fallbackGeometry.type === 'cone' && (
                <>
                  <coneGeometry args={fallbackGeometry.args as [number, number, number]} />
                  <meshStandardMaterial color={colorObj} />
                </>
              )}
            </mesh>
          </group>
        }
      >
        {modelIndex === 0 && <BuildingModel modelOffset={modelOffset} />}
        {modelIndex === 1 && <UAVModel modelOffset={modelOffset} />}
        {modelIndex === 2 && <BookModel modelOffset={modelOffset} />}
        {modelIndex === 3 && <FutureIslandModel modelOffset={modelOffset} />}
      </Suspense>

      {/* Accent bar for sections with models */}
      {index < 4 && (
        <mesh position={[modelOffset, -1, 0]}>
          <boxGeometry args={[2, 0.1, 0.1]} />
          <meshStandardMaterial
            color={colorObj}
            emissive={colorObj}
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Business Overview Scene Component
 * Static 3D scene - model does not change with scroll position
 * Best practice: Single static model reduces memory usage and prevents context loss
 */
export function BusinessOverviewScene({
  currentSection,
  scrollProgress,
  modelOffset = 0,
}: BusinessOverviewSceneProps) {
  const { previousRoot, camera, gl } = useThree();
  const isPortal = !!previousRoot;

  // Fixed camera position
  const cameraPosition = useMemo(() => {
    const textPanelEndX = 9;
    const modelX = modelOffset;
    return {
      position: [textPanelEndX * 0.5, 1.5, 4] as [number, number, number],
      target: [modelX, 0, 0] as [number, number, number],
    };
  }, [modelOffset]);

  // Set camera position once on mount
  useEffect(() => {
    if (!camera) return;

    const webglContext = gl.getContext() as WebGLRenderingContext | WebGL2RenderingContext | null;
    if (webglContext && !webglContext.isContextLost()) {
      camera.position.set(...cameraPosition.position);
      camera.lookAt(...cameraPosition.target);
    }
  }, [camera, cameraPosition, gl]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} castShadow={!isPortal} />

      {/* Environment */}
      {!isPortal && <Environment preset="city" />}

      {/* Section-specific 3D content */}
      {currentSection > 0 && currentSection <= businessSections.length && (
        <BusinessSection
          key={`${businessSections[currentSection - 1].id}-${currentSection}`}
          index={currentSection - 1}
          modelOffset={modelOffset}
          color={businessSections[currentSection - 1].color || '#0066ff'}
        />
      )}

      {/* Contact Shadows */}
      {!isPortal && (
        <ContactShadows
          frames={1}
          rotation-x={[Math.PI / 2]}
          position={[modelOffset, -1.5, 0]}
          far={2}
          width={10}
          height={10}
          blur={3}
          opacity={0.3}
        />
      )}

      {/* Orbit Controls */}
      {!isPortal && (
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={8}
          enableZoom={true}
          enablePan={true}
          autoRotate={false}
          target={cameraPosition.target}
        />
      )}
    </>
  );
}
