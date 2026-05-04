import * as THREE from 'three';
import type { HandData } from './fbo';

export interface VirtualHandData {
  handMatrices: Float32Array;
  palmVelocity: THREE.Vector3;
}

/**
 * Adapts useVirtualHand output to match the original hand data format
 */
export function adaptHandData(virtualHand: VirtualHandData): HandData {
  const matrices = new Array(16).fill(null).map(() => new THREE.Matrix4());
  
  // Extract matrices from Float32Array
  for (let i = 0; i < 16; i++) {
    const offset = i * 16;
    matrices[i].fromArray(Array.from(virtualHand.handMatrices.slice(offset, offset + 16)));
  }

  return {
    palmOutputMatrix: matrices[0],
    fingerBones: matrices.slice(1).map((m) => ({ outputMatrix: m })),
    palmVelocity: virtualHand.palmVelocity,
  };
}
