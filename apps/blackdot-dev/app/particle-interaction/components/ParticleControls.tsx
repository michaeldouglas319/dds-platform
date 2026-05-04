'use client';

interface ParticleControlsProps {
  particleCount: number;
  setParticleCount: (count: number) => void;
  handBounceRatio: number;
  setHandBounceRatio: (ratio: number) => void;
  handForce: number;
  setHandForce: (force: number) => void;
  gravity: number;
  setGravity: (gravity: number) => void;
  fps?: number;
}

export function ParticleControls({}: ParticleControlsProps) {
  return <div className="absolute top-4 right-4 w-80 max-h-[calc(100vh-32px)]" />;
}
