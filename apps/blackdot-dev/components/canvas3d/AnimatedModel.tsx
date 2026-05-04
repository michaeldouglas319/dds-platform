'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useAnimatedModel } from '@/hooks/use-animated-model';
import type { Canvas3DModel } from '@/lib/types/canvas3d.types';
import type { Group } from 'three';

export function AnimatedModel({ modelPath, position, rotation, scale, animation, interactive }: Canvas3DModel) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(modelPath);

  // Clone once per scene reference; R3F caches by URL so scene is stable per modelPath
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    return () => {
      clonedScene.traverse((obj) => {
        const o = obj as { geometry?: { dispose: () => void }; material?: { dispose: () => void }; materials?: { dispose: () => void }[] };
        if (o.geometry?.dispose) o.geometry.dispose();
        if (o.material?.dispose) o.material.dispose();
        if (Array.isArray(o.materials)) o.materials.forEach((m) => m?.dispose?.());
      });
    };
  }, [clonedScene]);

  useAnimatedModel(groupRef, animation);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={interactive ? (e) => e.stopPropagation() : undefined}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

