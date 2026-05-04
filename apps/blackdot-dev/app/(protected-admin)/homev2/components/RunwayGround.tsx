'use client';

import * as THREE from 'three';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { RUNWAY_CONFIG } from '../config/runway.config';

export function RunwayGround() {
  const config = RUNWAY_CONFIG.ground;

  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[config.width, config.length]} />
        <meshStandardMaterial
          color={config.color}
          roughness={config.roughness}
          metalness={config.metalness}
        />
      </mesh>

      {/* Physics collider for ground - scaled to match plane dimensions */}
      <CuboidCollider
        args={[config.width / 2, 0.1, config.length / 2]}
        position={[0, -0.1, 0]}
      />
    </RigidBody>
  );
}
