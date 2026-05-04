import * as THREE from 'three';

export interface FBOParticlesConfig {
  particleCount: number;
  dropRadius?: number;
  fromY?: number;
  yDynamicRange?: number;
}

export interface ParticlePhysics {
  handBounceRatio: number;
  handForce: number;
  gravity: number;
}

export interface VirtualHandState {
  handMatrices: Float32Array;
  handPosition: THREE.Vector3;
  palmVelocity: THREE.Vector3;
  isGripping: boolean;
}

export interface ParticleStats {
  fps: number;
  particles: number;
  renderTime?: number;
  computeTime?: number;
}
