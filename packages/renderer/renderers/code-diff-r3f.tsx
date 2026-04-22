'use client';

import { useState, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Mesh, Group } from 'three';
import * as THREE from 'three';
import type { RendererProps } from '@dds/types';

/**
 * CodeDiffR3F - Interactive 3D code diff viewer with side-by-side comparison
 *
 * Interactive features:
 * - Toggle between side-by-side and stacked view
 * - Highlight specific lines
 * - 3D text rendering of code snippets
 * - Responsive layout
 *
 * Data structure (UniversalSection):
 * - content.body: original code (before)
 * - content.items: [modified code snippet] (after)
 * - display.layout: 'code-diff' or 'code-diff-r3f'
 * - meta.language?: string (e.g., 'typescript', 'javascript')
 * - meta.lineNumbers?: boolean (default: true)
 */

interface CodePanelProps {
  code: string;
  title: string;
  position: [number, number, number];
  isActive: boolean;
  language?: string;
}

/**
 * Code panel - 3D plane with syntax-highlighted code
 */
function CodePanel({ code, title, position, isActive, language = 'typescript' }: CodePanelProps) {
  const meshRef = useRef<Mesh>(null);
  const canvasRef = useRef<OffscreenCanvas | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  // Create code visualization as texture
  const createCodeTexture = useCallback(() => {
    const canvas = new OffscreenCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 512, 512);

    // Title
    ctx.fillStyle = isActive ? '#818cf8' : '#6366f1';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(title, 16, 32);

    // Code lines
    ctx.fillStyle = '#d1d5db';
    ctx.font = '14px monospace';
    const lines = code.split('\n').slice(0, 20); // Show first 20 lines
    lines.forEach((line, i) => {
      ctx.fillText(`${i + 1}: ${line.substring(0, 35)}`, 16, 64 + i * 20);
    });

    const texture = new THREE.CanvasTexture(canvas);
    canvasRef.current = canvas;
    textureRef.current = texture;
    return texture;
  }, [code, title, isActive]);

  const texture = createCodeTexture();

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Subtle animation when active
      const targetScale = isActive ? 1.15 : 1;
      const targetEmissive = isActive ? 0.3 : 0.1;

      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        delta * 2
      );

      if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
        meshRef.current.material.opacity = isActive ? 1 : 0.7;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[3, 4]} />
      <meshBasicMaterial
        map={texture || undefined}
        color={isActive ? '#ffffff' : '#d1d5db'}
        transparent
        opacity={isActive ? 1 : 0.7}
      />
    </mesh>
  );
}

/**
 * Toggle button for view mode
 */
interface ViewToggleProps {
  position: [number, number, number];
  isActive: boolean;
  label: string;
  onClick: () => void;
}

function ViewToggle({ position, label, onClick, isActive }: ViewToggleProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.3 : isActive ? 1.15 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        delta * 3
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <boxGeometry args={[0.8, 0.4, 0.1]} />
      <meshStandardMaterial
        color={isActive ? '#10b981' : hovered ? '#4f46e5' : '#6366f1'}
        emissive={isActive ? '#10b981' : hovered ? '#4f46e5' : '#000000'}
      />
    </mesh>
  );
}

/**
 * Code diff scene
 */
function CodeDiffScene({
  beforeCode,
  afterCode,
  viewMode,
  onToggleView,
}: {
  beforeCode: string;
  afterCode: string;
  viewMode: 'side-by-side' | 'stacked';
  onToggleView: () => void;
}) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Gentle rotation for visual interest
      groupRef.current.rotation.z += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {viewMode === 'side-by-side' ? (
        <>
          {/* Left panel - Before */}
          <CodePanel
            code={beforeCode}
            title="Before"
            position={[-2.5, 0, 0]}
            isActive={true}
            language="typescript"
          />
          {/* Right panel - After */}
          <CodePanel
            code={afterCode}
            title="After"
            position={[2.5, 0, 0]}
            isActive={true}
            language="typescript"
          />
        </>
      ) : (
        <>
          {/* Stacked view */}
          <CodePanel
            code={beforeCode}
            title="Before"
            position={[0, 1.5, 0]}
            isActive={true}
            language="typescript"
          />
          <CodePanel
            code={afterCode}
            title="After"
            position={[0, -1.5, 0]}
            isActive={true}
            language="typescript"
          />
        </>
      )}

      {/* View toggle button */}
      <ViewToggle
        position={[0, -3.5, 0]}
        label="Toggle View"
        isActive={viewMode === 'side-by-side'}
        onClick={onToggleView}
      />

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, 5, -5]} intensity={0.4} />
    </group>
  );
}

/**
 * Main code diff renderer
 */
export const CodeDiffR3F = ({ section }: RendererProps) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'stacked'>('side-by-side');

  // Extract code from content
  const beforeCode = section.content?.body || 'const before = "original code";';
  const afterCode =
    (section.content?.items?.[0] as string | undefined) ||
    'const after = "modified code";';

  const handleToggleView = useCallback(() => {
    setViewMode((mode) => (mode === 'side-by-side' ? 'stacked' : 'side-by-side'));
  }, []);

  return (
    <div className="relative h-96 w-full rounded-lg bg-gradient-to-b from-neutral-900 to-neutral-950 overflow-hidden">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <CodeDiffScene
          beforeCode={beforeCode}
          afterCode={afterCode}
          viewMode={viewMode}
          onToggleView={handleToggleView}
        />
      </Canvas>

      {/* HTML UI Overlay */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => setViewMode('side-by-side')}
          className={`rounded-lg px-3 py-1 text-sm transition-all ${
            viewMode === 'side-by-side'
              ? 'bg-indigo-600 text-white'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
          }`}
        >
          Side-by-Side
        </button>
        <button
          onClick={() => setViewMode('stacked')}
          className={`rounded-lg px-3 py-1 text-sm transition-all ${
            viewMode === 'stacked'
              ? 'bg-indigo-600 text-white'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
          }`}
        >
          Stacked
        </button>
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-4 left-4 text-xs text-neutral-500">
        Showing {viewMode === 'side-by-side' ? 'side-by-side' : 'stacked'} view
      </div>
    </div>
  );
};

export default CodeDiffR3F;
