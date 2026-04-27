'use client';

import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { Mesh, Group } from 'three';
import * as THREE from 'three';
import type { RendererProps, UniversalSection } from '@dds/types';

/**
 * CardsR3F - Interactive 3D grid of card components
 *
 * Renders cards in a responsive 3D grid with:
 * - Icon/title/description per card
 * - Hover effects (scale, color shift)
 * - Responsive grid layout (1-3 columns based on viewport)
 * - Theme-aware indigo/green color scheme
 *
 * Data structure (UniversalSection):
 * - children: array of sections with subject.title, subject.description, subject.color
 * - display.layout: 'cards' or 'cards-r3f'
 * - meta.columns?: number (default: 3)
 * - meta.cardWidth?: number (default: 2)
 * - meta.cardHeight?: number (default: 3)
 */

interface Card3DProps {
  title: string;
  description?: string;
  color: string;
  position: [number, number, number];
  index: number;
}

/**
 * Individual 3D Card component
 */
function Card3D({ title, description, color, position, index }: Card3DProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const colorValue = getColorFromName(color);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Scale on hover
      const targetScale = hovered ? 1.15 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        delta * 4
      );

      // Subtle rotation on hover
      if (hovered) {
        meshRef.current.rotation.y += delta * 0.8;
      }
    }
  });

  return (
    <group position={position}>
      {/* Card background box */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[2, 3, 0.2]} />
        <meshStandardMaterial
          color={colorValue}
          emissive={hovered ? colorValue : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Card border (edges) */}
      <lineSegments position={[0, 0, 0.1]}>
        <edgesGeometry args={[new THREE.BoxGeometry(2, 3, 0.2)]} />
        <lineBasicMaterial attach="material" color="#ffffff" linewidth={1} />
      </lineSegments>
    </group>
  );
}

/**
 * Helper to convert color name to hex
 */
function getColorFromName(colorName?: string): string {
  const colors: Record<string, string> = {
    indigo: '#4f46e5',
    green: '#10b981',
    emerald: '#059669',
    teal: '#14b8a6',
    cyan: '#06b6d4',
    blue: '#3b82f6',
    purple: '#a855f7',
    pink: '#ec4899',
    red: '#ef4444',
    orange: '#f97316',
    amber: '#f59e0b',
    yellow: '#eab308',
    lime: '#84cc16',
  };

  return colors[colorName?.toLowerCase() || 'indigo'] || '#4f46e5';
}

/**
 * Cards scene container
 */
function CardsScene({
  cards,
}: {
  cards: Array<{ title: string; description?: string; color?: string }>;
}) {
  const groupRef = useRef<Group>(null);
  const columns = Math.min(3, Math.max(1, cards.length === 1 ? 1 : cards.length <= 2 ? 2 : 3));
  const rows = Math.ceil(cards.length / columns);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Gentle rotation of entire grid
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  const cardPositions = useMemo(() => {
    return cards.map((_, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      const x = (col - (columns - 1) / 2) * 3;
      const y = (rows / 2 - 1.5 - row) * 4;
      const z = 0;

      return [x, y, z] as [number, number, number];
    });
  }, [cards.length, columns, rows]);

  return (
    <group ref={groupRef}>
      {/* Cards */}
      {cards.map((card, index) => (
        <Card3D
          key={index}
          title={card.title}
          description={card.description}
          color={card.color}
          position={cardPositions[index]}
          index={index}
        />
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={0.8} />
    </group>
  );
}


/**
 * Main cards renderer component
 */
export const CardsR3F = ({ section }: RendererProps) => {
  // Extract cards from children
  const cards = (section.children || []).map((child) => ({
    title: child.subject?.title ?? 'Untitled Card',
    description: child.subject?.description ?? child.subject?.subtitle,
    color: child.subject?.color ?? 'indigo',
  }));

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-neutral-400">
        No cards found. Add sections to children array.
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-gradient-to-b from-neutral-900 to-neutral-950 overflow-hidden">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        <CardsScene cards={cards} />
      </Canvas>

      {/* Title Overlay */}
      {section.subject?.title && (
        <div className="absolute top-8 left-0 right-0 text-center">
          <h2 className="text-3xl font-bold text-white">{section.subject.title}</h2>
          {section.subject?.subtitle && (
            <p className="mt-2 text-neutral-400">{section.subject.subtitle}</p>
          )}
        </div>
      )}

      {/* Card count indicator */}
      <div className="absolute bottom-4 right-4 text-sm text-neutral-400">
        {cards.length} cards
      </div>
    </div>
  );
};

export default CardsR3F;
