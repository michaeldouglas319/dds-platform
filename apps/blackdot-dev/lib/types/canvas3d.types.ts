/**
 * React Three Fiber Config-Driven Types
 * Extends UnifiedSection with 3D canvas support
 */

export interface Canvas3DAnimation {
  type: 'float' | 'rotate' | 'pulse' | 'wave' | 'custom';
  speed: number;
  amplitude: number;
}

export interface Canvas3DModel {
  id: string;
  modelPath: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  animation?: Canvas3DAnimation;
  interactive?: boolean;
}

export interface Canvas3DLight {
  type: 'directional' | 'ambient' | 'point' | 'spot';
  intensity: number;
  position?: [number, number, number];
  color?: string;
}

export interface Canvas3DScene {
  background: string;
  fog?: { near: number; far: number; color?: string };
  lights: Canvas3DLight[];
}

export interface Canvas3DConfig {
  models?: Canvas3DModel[];
  scene?: Canvas3DScene;
  fallbackMode?: 'image' | 'text' | 'hidden';
  camera?: {
    position?: [number, number, number];
    fov?: number;
  };
}
