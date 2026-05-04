import * as THREE from 'three';

export type ParticleState = 'roaming' | 'evaluating' | 'integrating' | 'integrated';

export type Particle = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  state: ParticleState;
  color: THREE.Color;
  evaluationTimer: number;
  targetNodeIdx: number | null;
  scale: number;
};

export type HandoffData = {
  particleIdx: number;
  nodeIdx: number;
  timer: number;
  startTime: number;
};



