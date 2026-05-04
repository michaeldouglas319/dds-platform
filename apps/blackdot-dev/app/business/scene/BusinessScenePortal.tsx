'use client';

import { Suspense } from 'react';
import { Center } from '@react-three/drei';
import * as THREE from 'three';
import { BuildingModel } from '@/lib/scenes/models';

/**
 * BusinessScenePortal - Portal-compatible version for overview cards
 * Renders Building model optimized for portal rendering
 * Shows model in compact card view
 */
export function BusinessScenePortal() {
  const colorObj = new THREE.Color('#0066ff');

  return (
    <group>
      <Suspense
        fallback={
          <group>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[2, 2, 2]} />
              <meshStandardMaterial color={colorObj} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        }
      >
        {/* Portal shows building model */}
        <Center position={[0, 0, 0]}>
          <BuildingModel modelOffset={0} />
        </Center>
      </Suspense>

      {/* Accent bar */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[2, 0.1, 0.1]} />
        <meshStandardMaterial
          color={colorObj}
          emissive={colorObj}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}




