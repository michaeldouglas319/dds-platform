'use client';

import { useState, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, OrbitControls } from '@react-three/drei';
import type { Mesh, Group } from 'three';
import * as THREE from 'three';
import type { RendererProps } from '@dds/types';

/**
 * CarouselR3F - Interactive 3D carousel renderer with navigation buttons
 *
 * Interactive features:
 * - Previous/Next button controls
 * - Auto-cycling through carousel items
 * - 3D image planes in a circular arrangement
 * - Responsive viewport scaling
 *
 * Data structure (UniversalSection):
 * - children: array of sections with media.image or media.themedImage
 * - display.layout: 'carousel' or 'carousel-r3f'
 * - meta.autoplay?: boolean (default: false)
 * - meta.itemCount?: number (default: children.length)
 */

interface CarouselItemProps {
  position: [number, number, number];
  rotation: [number, number, number];
  imageUrl: string;
  isActive: boolean;
}

/**
 * Individual carousel item - 3D plane with image texture
 */
function CarouselItem({ position, rotation, imageUrl, isActive }: CarouselItemProps) {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture(imageUrl);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Scale up when active, down when inactive
      const targetScale = isActive ? 1.2 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        delta * 3
      );

      // Adjust opacity based on active state
      if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
        meshRef.current.material.opacity = isActive ? 1 : 0.5;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[2, 2.5]} />
      <meshBasicMaterial map={texture} transparent opacity={0.5} />
    </mesh>
  );
}

/**
 * Navigation button in 3D space
 */
interface NavButtonProps {
  position: [number, number, number];
  label: string;
  onClick: () => void;
}

function NavButton({ position, label, onClick }: NavButtonProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.2 : 1;
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
      <boxGeometry args={[0.6, 0.6, 0.1]} />
      <meshStandardMaterial
        color={hovered ? '#4f46e5' : '#6366f1'}
        emissive={hovered ? '#6366f1' : '#000000'}
      />
    </mesh>
  );
}

/**
 * Main carousel scene
 */
function CarouselScene({
  items,
  currentIndex,
  onPrev,
  onNext,
}: {
  items: string[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Smooth camera zoom based on viewport
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  const itemCount = items.length;
  const anglePerItem = (2 * Math.PI) / itemCount;

  return (
    <group ref={groupRef}>
      {/* Carousel items arranged in a circle */}
      {items.map((imageUrl, index) => {
        const angle = anglePerItem * index + (anglePerItem * currentIndex) / 2;
        const radius = 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <CarouselItem
            key={index}
            position={[x, 0, z]}
            rotation={[0, -angle, 0]}
            imageUrl={imageUrl}
            isActive={index === currentIndex}
          />
        );
      })}

      {/* Navigation buttons */}
      <NavButton position={[-3, 0, 0]} label="←" onClick={onPrev} />
      <NavButton position={[3, 0, 0]} label="→" onClick={onNext} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, 10, -10]} intensity={0.4} />

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate={false}
        maxDistance={15}
        minDistance={8}
      />
    </group>
  );
}

/**
 * Main carousel renderer component
 */
export const CarouselR3F = ({ section }: RendererProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Extract image URLs from children
  const imageUrls = (section.children || [])
    .map((child) => {
      if (child.media?.image) {
        return typeof child.media.image === 'string' ? child.media.image : child.media.image.src;
      }
      if (child.media?.themedImage) {
        return child.media.themedImage.dark.src;
      }
      return null;
    })
    .filter((url): url is string => url !== null);

  if (imageUrls.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-neutral-400">
        No carousel items found. Add images to children sections.
      </div>
    );
  }

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + imageUrls.length) % imageUrls.length);
  }, [imageUrls.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % imageUrls.length);
  }, [imageUrls.length]);

  return (
    <div className="relative h-96 w-full rounded-lg bg-gradient-to-b from-neutral-900 to-neutral-950 overflow-hidden">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <CarouselScene
          items={imageUrls}
          currentIndex={currentIndex}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </Canvas>

      {/* HTML UI Overlay */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-all hover:bg-indigo-500 active:scale-95"
          aria-label="Previous item"
        >
          ← Prev
        </button>

        <div className="text-sm text-neutral-400">
          {currentIndex + 1} / {imageUrls.length}
        </div>

        <button
          onClick={handleNext}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-all hover:bg-indigo-500 active:scale-95"
          aria-label="Next item"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default CarouselR3F;
