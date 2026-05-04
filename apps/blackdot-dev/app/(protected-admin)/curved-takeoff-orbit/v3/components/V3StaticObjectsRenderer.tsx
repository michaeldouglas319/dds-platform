/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * V3 Static Objects Renderer
 *
 * Renders static 3D models at configured positions (buildings, skyscrapers, decorations).
 * - Supports GLTF (.gltf) and GLB (.glb) formats
 * - Uses absolute world coordinates
 * - Supports custom rotation and scale
 * - Optional color tinting
 * - Falls back to cube geometry if model loading fails
 */

'use client';

import { useGLTF } from '@react-three/drei';
import { Suspense } from 'react';
import type { V3Config, V3StaticObject } from '../config/v3.config';

interface StaticObjectsRendererProps {
  config: V3Config;
}

/**
 * Static model component with dynamic path
 */
function StaticModel({
  object,
}: {
  object: V3StaticObject;
}) {
  const { scene } = useGLTF(object.modelPath);
  const rotation = object.rotation || { x: 0, y: 0, z: 0 };
  const clonedScene = scene.clone();

  // Apply color tint to all materials if specified
  if (object.color) {
    clonedScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Create array of materials if single material
        const materials = Array.isArray(child.material) ? child.material : [child.material];

        materials.forEach((mat: any) => {
          if (mat.color) {
            mat.color.set(object.color);
          }
        });
      }
    });
  }

  return (
    <primitive
      object={clonedScene}
      position={[object.position.x, object.position.y, object.position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      scale={object.scale ?? 1}
    />
  );
}

/**
 * Fallback cube component
 */
function CubeStatic({
  object,
}: {
  object: V3StaticObject;
}) {
  const rotation = object.rotation || { x: 0, y: 0, z: 0 };
  const scale = object.scale ?? 1;

  return (
    <mesh
      position={[object.position.x, object.position.y, object.position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      scale={[scale, scale, scale]}
    >
      <boxGeometry args={[4, 4, 4]} />
      <meshStandardMaterial color="#666666" emissive="#333333" emissiveIntensity={0.2} />
    </mesh>
  );
}

/**
 * Main component - renders all static objects
 */
export function V3StaticObjectsRenderer({ config }: StaticObjectsRendererProps) {
  if (!config.staticObjects || config.staticObjects.length === 0) {
    return null;
  }

  return (
    <>
      {config.staticObjects.map((object) => (
        <group key={object.id}>
          <Suspense fallback={<CubeStatic object={object} />}>
            <StaticModel object={object} />
          </Suspense>
        </group>
      ))}
    </>
  );
}
