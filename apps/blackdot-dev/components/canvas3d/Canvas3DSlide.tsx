'use client';

import { Suspense, useMemo, useEffect } from 'react';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { StandardCanvas } from '@/components/three/StandardCanvas';
import type { Canvas3DConfig } from '@/lib/types/canvas3d.types';
import { resolveCanvas3DConfig } from '@/lib/config/canvas3d-resolver';
import { AnimatedModel } from './AnimatedModel';

interface Canvas3DSlideProps {
  config: Canvas3DConfig;
  className?: string;
}

export function Canvas3DSlide({ config, className = 'h-full w-full' }: Canvas3DSlideProps) {
  const resolved = useMemo(() => resolveCanvas3DConfig(config), [config]);
  const { models = [], scene, camera, fallbackMode = 'text' } = resolved;

  const modelPaths = useMemo(
    () => [...new Set((resolved.models ?? []).map((m) => m.modelPath).filter(Boolean))],
    [resolved.models]
  );
  useEffect(() => {
    modelPaths.forEach((path) => useGLTF.preload(path));
  }, [modelPaths]);

  return (
    <StandardCanvas
      className={className}
      camera={{
        position: camera?.position || [0, 0, 5],
        fov: camera?.fov || 50,
      }}
      style={{ background: scene?.background || '#000' }}
      performance="auto"
      frameloop="always"
    >
      <Suspense fallback={<FallbackContent mode={fallbackMode} />}>
        {/* Lights */}
        {scene?.lights.map((light, i) => (
          <SceneLight key={i} {...light} />
        ))}

        {/* Fog */}
        {scene?.fog && <fog attach="fog" args={[scene.fog.color || '#000', scene.fog.near, scene.fog.far]} />}

        {/* Models */}
        {models.map((model) => (
          <AnimatedModel key={model.id} {...model} />
        ))}

        <OrbitControls enableDamping dampingFactor={0.05} />
      </Suspense>
    </StandardCanvas>
  );
}

function SceneLight({ type, intensity, position, color }: { type: string; intensity: number; position?: [number, number, number]; color?: string }) {
  if (type === 'ambient') return <ambientLight intensity={intensity} color={color} />;
  if (type === 'directional')
    return <directionalLight position={position || [5, 5, 5]} intensity={intensity} color={color} />;
  if (type === 'point') return <pointLight position={position || [0, 0, 0]} intensity={intensity} color={color} />;
  return null;
}

function FallbackContent({ mode }: { mode: Canvas3DConfig['fallbackMode'] }) {
  if (mode === 'hidden') return null;
  if (mode === 'text')
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#666" />
      </mesh>
    );
  return null;
}
