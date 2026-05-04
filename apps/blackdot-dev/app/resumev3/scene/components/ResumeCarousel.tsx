"use client"

import React, { useRef, useState, useMemo, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Image, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';
import { carouselModels, type CarouselModelConfig } from './carouselModels.config';
import { NeuralNetwork } from '@/app/landing/node/NeuralNetwork';
import { MorphModelRenderer } from './MorphModelRenderer';

interface ResumeCarouselProps {
  modelOffset?: number;
  radius?: number;
  autoRotateSpeed?: number;
  onCardClick?: (jobIndex: number, jobId: string) => void;
  enableMorph?: boolean; // New: Enable morph animations on hover
}

/**
 * Resume Carousel Component
 * Auto-rotating carousel displaying all unique model logos
 * Based on cydstumpel.nl pattern
 */
export function ResumeCarousel({
  modelOffset = 0,
  radius = 1.4,
  autoRotateSpeed = 0.3,
  onCardClick,
  enableMorph = true, // Default: morph enabled with automatic fallback
}: ResumeCarouselProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rotationOffset = useRef(0);

  // Auto-rotation animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      rotationOffset.current += delta * autoRotateSpeed;
      groupRef.current.rotation.y = rotationOffset.current;
    }
  });

  // Position carousel center at modelOffset to match individual job model positions
  // This ensures the carousel appears at the same X offset as individual models in full screen
  return (
    <group ref={groupRef} position={[modelOffset, 0, 0]}>
      {carouselModels.map((model, i) => (
        <CarouselCard
          key={model.jobId}
          model={model}
          index={i}
          total={carouselModels.length}
          radius={radius}
          onCardClick={onCardClick}
          enableMorph={enableMorph}
        />
      ))}
    </group>
  );
}

interface CarouselCardProps {
  model: CarouselModelConfig;
  index: number;
  total: number;
  radius: number;
  onCardClick?: (jobIndex: number, jobId: string) => void;
  enableMorph?: boolean;
}

/**
 * Individual Carousel Card
 * Handles hover effects and click interactions
 * Cards always face the camera (billboard behavior)
 */
function CarouselCard({ model, index, total, radius, onCardClick, enableMorph = true }: CarouselCardProps) {
  const ref = useRef<THREE.Group | THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  // Calculate position in circle
  const angle = (index / total) * Math.PI * 2;
  const position: [number, number, number] = [
    Math.sin(angle) * radius,
    0,
    Math.cos(angle) * radius,
  ];

  // Hover animation and billboard rotation (always face camera)
  useFrame((state, delta) => {
    if (ref.current) {
      // Make card always face the camera (billboard effect)
      const cardWorldPos = new THREE.Vector3();
      ref.current.getWorldPosition(cardWorldPos);
      
      // Make the card look at the camera
      if (ref.current instanceof THREE.Group || ref.current instanceof THREE.Mesh) {
        ref.current.lookAt(camera.position);
      }
      
      // Handle scale for both groups and meshes
      if ('scale' in ref.current) {
        easing.damp3(ref.current.scale, hovered ? 1.15 : 1, 0.1, delta);
      }
      // Handle material properties for Image component
      if ('material' in ref.current && ref.current.material) {
        const material = ref.current.material as THREE.Material & Record<string, unknown>;
        if ('radius' in material) {
          easing.damp(material, 'radius', hovered ? 0.25 : 0.1, 0.2, delta);
        }
        if ('zoom' in material) {
          easing.damp(material, 'zoom', hovered ? 1 : 1.5, 0.2, delta);
        }
      }
    }
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCardClick) {
      onCardClick(model.jobIndex + 1, model.jobId); // +1 because section 0 is hero
    }
  };

  const handlePointerOver = (e: React.PointerEvent) => {
    e.stopPropagation();
    setHovered(true);
  };

  const handlePointerOut = () => {
    setHovered(false);
  };

  // Render different model types
  if (model.modelType === 'tesla') {
    return (
      <TeslaCard
        ref={ref as React.Ref<THREE.Group>}
        position={position}
        hovered={hovered}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        enableMorph={enableMorph}
      />
    );
  }

  if (model.modelType === 'neural-network') {
    return (
      <NeuralNetworkCard
        ref={ref as React.Ref<THREE.Group>}
        position={position}
        hovered={hovered}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />
    );
  }

  // Texture-based logos (Renewed Vision, Skyline, GCS)
  if (model.textureUrl) {
    return (
      <Suspense fallback={null}>
        <ImageCard
          ref={ref as React.Ref<THREE.Mesh>}
          textureUrl={model.textureUrl}
          position={position}
          hovered={hovered}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />
      </Suspense>
    );
  }

  return null;
}

/**
 * Tesla Logo Card (GLB Model with Optional Morph)
 */
const TeslaCard = React.forwardRef<THREE.Group, {
  position: [number, number, number];
  hovered: boolean;
  onPointerOver: (e: React.PointerEvent) => void;
  onPointerOut: () => void;
  onClick: (e: React.MouseEvent) => void;
  enableMorph?: boolean;
}>((props, ref) => {
  const { position, hovered, onPointerOver, onPointerOut, onClick, enableMorph = true } = props;

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    >
      <MorphModelRenderer
        modelType="tesla"
        scale={0.6}
        enableMorph={enableMorph}
        isHovered={hovered}
        morphIntensity={0.4} // Subtle effect for carousel
      />
    </group>
  );
});
TeslaCard.displayName = 'TeslaCard';

/**
 * Neural Network Card
 */
const NeuralNetworkCard = React.forwardRef<THREE.Group, {
  position: [number, number, number];
  hovered: boolean;
  onPointerOver: (e: React.PointerEvent) => void;
  onPointerOut: () => void;
  onClick: (e: React.MouseEvent) => void;
}>((props, ref) => {
  return (
    <group ref={ref} {...props}>
      <NeuralNetwork position={[0, 0, 0]} scale={0.4} />
    </group>
  );
});
NeuralNetworkCard.displayName = 'NeuralNetworkCard';

/**
 * Image-based Logo Card
 */
const ImageCard = React.forwardRef<THREE.Mesh, {
  textureUrl: string;
  position: [number, number, number];
  hovered: boolean;
  onPointerOver: (e: React.PointerEvent) => void;
  onPointerOut: () => void;
  onClick: (e: React.MouseEvent) => void;
}>(({ textureUrl, ...props }, ref) => {
  return (
    <Image
      ref={ref}
      url={textureUrl}
      transparent
      scale={0.8} // Scale images to fit within carousel
      {...props}
    />
  );
});
ImageCard.displayName = 'ImageCard';

