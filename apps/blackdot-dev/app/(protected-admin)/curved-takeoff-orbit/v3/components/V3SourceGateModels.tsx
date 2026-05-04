/**
 * V3 Source Gate Models
 *
 * Renders 3D models at each source gate position.
 * - Uses gourmet_factory model for defined sources
 * - Falls back to cube geometry if model loading fails
 */

'use client';

import { useGLTF } from '@react-three/drei';
import { Suspense } from 'react';
import type { V3Config } from '../config/v3.config';

interface SourceGateModelsProps {
  config: V3Config;
}

/**
 * Gourmet Factory Model component
 */
function GourmetFactoryModel({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const { scene } = useGLTF('/assets/models/gourmet_factory/scene.gltf');

  return (
    <primitive
      object={scene.clone()}
      position={position}
      scale={[scale, scale, scale]}
    />
  );
}

/**
 * Fallback cube component
 */
function CubeGate({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  return (
    <mesh position={position} scale={[scale, scale, scale]}>
      <boxGeometry args={[4, 4, 4]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
}

/**
 * Main component - renders models at all source positions
 */
export function V3SourceGateModels({ config }: SourceGateModelsProps) {
  return (
    <>
      {config.sources.map((source) => {
        const position: [number, number, number] = [
          source.gatePosition.x,
          source.gatePosition.y,
          source.gatePosition.z,
        ];

        // Use scale from config or default
        const scale = source.modelScale || 1;

        return (
          <group key={source.id}>
            <Suspense
              fallback={
                <CubeGate
                  position={position}
                  color={source.particleColor}
                  scale={scale } // Smaller cube fallback
                />
              }
            >
              <GourmetFactoryModel
                position={position}
                scale={scale * 0.06} // Smaller model scale
              />
            </Suspense>
          </group>
        );
      })}
    </>
  );
}

// Preload the gourmet factory model
useGLTF.preload('/assets/models/gourmet_factory/scene.gltf');
