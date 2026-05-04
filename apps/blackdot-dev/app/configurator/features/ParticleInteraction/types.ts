export interface ParticleInteractionConfig {
  enabled: boolean;
  particleCount: number;
  handBounceRatio: number;
  handForce: number;
  gravity: number;
}

export interface ParticleStats {
  fps: number;
  particleCount: number;
  computeTime?: number;
}
