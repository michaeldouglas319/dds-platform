import * as THREE from 'three';

export interface NetworkRef {
  handleCollision: (color: THREE.Color, intensity: number) => void;
  getPosition: () => THREE.Vector3;
  integrateParticle: (position: THREE.Vector3, startScale?: number) => number;
  getNodePositions: () => THREE.Vector3[];
}



