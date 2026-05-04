'use client';

import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { Canvas3DAnimation } from '@/lib/types/canvas3d.types';

export function useAnimatedModel(ref: RefObject<Group | null>, animation?: Canvas3DAnimation) {
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!ref.current || !animation) return;

    timeRef.current += delta * (animation.speed || 1);
    const time = timeRef.current;

    switch (animation.type) {
      case 'float':
        ref.current.position.y += Math.sin(time * 2) * animation.amplitude * delta;
        break;

      case 'rotate':
        ref.current.rotation.y += animation.speed * delta;
        break;

      case 'pulse':
        const scale = 1 + Math.sin(time * 3) * animation.amplitude * 0.1;
        ref.current.scale.setScalar(scale);
        break;

      case 'wave':
        ref.current.position.x += Math.sin(time) * animation.amplitude * delta;
        ref.current.position.z += Math.cos(time) * animation.amplitude * delta;
        break;
    }
  });

  return ref;
}
