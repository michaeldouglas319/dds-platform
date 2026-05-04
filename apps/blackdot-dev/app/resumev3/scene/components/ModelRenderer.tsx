"use client"

/**
 * Shared Model Renderer Component
 * Reusable model rendering logic for both 3D scenes and inline Canvas contexts
 * Supports all model types: Tesla GLB, texture-based logos, NeuralNetwork
 */

import { Suspense, useMemo } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { NeuralNetwork } from '@/app/landing/node/NeuralNetwork';
import type { ModelType } from '@/lib/config/models/resumeModels.config';

// Re-export for backward compatibility
export type { ModelType };

interface ModelRendererProps {
  modelType: ModelType;
  textureUrl?: string;
  color?: string; // For geometry models
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  modelOffset?: number; // Legacy prop for backward compatibility
}

/**
 * Tesla Logo Model (GLB)
 */
function TeslaModel({ position = [0, 0, 0], rotation = [0, 0, 0], scale: customScale }: { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number }) {
  const gltfPath = '/assets/tesla_logo.glb';
  const { scene } = useGLTF(gltfPath);

  // Calculate bounding box to center and scale the model appropriately
  const { scale, center } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const centerVec = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleValue = (customScale || 2.5) / maxDim;
    return { scale: scaleValue, center: centerVec };
  }, [scene, customScale]);

  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <group position={position} rotation={rotation}>
      <primitive 
        object={clonedScene} 
        scale={[scale, scale, scale]}
        position={[-center.x * scale, -center.y * scale, -center.z * scale]}
      />
    </group>
  );
}

/**
 * Texture-based Logo Model (Renewed Vision, Skyline, GCS)
 */
function TextureLogoModel({ 
  textureUrl, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale: customScale = 2.5
}: { 
  textureUrl: string; 
  position?: [number, number, number]; 
  rotation?: [number, number, number];
  scale?: number;
}) {
  const texture = useTexture(textureUrl);
  
  // Calculate aspect ratio to maintain logo proportions
  const aspectRatio = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    if (img?.width && img.height) {
      return img.width / img.height;
    }
    return 1;
  }, [texture]);

  const logoWidth = customScale;
  const logoHeight = logoWidth / aspectRatio;

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[logoWidth, logoHeight]} />
        <meshStandardMaterial 
          map={texture} 
          transparent 
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/**
 * Neural Network Model
 */
function NeuralNetworkModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale: customScale = 1
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      <NeuralNetwork position={[0, -0.09, 0]} scale={customScale} />
    </group>
  );
}

/**
 * Procedural Geometry Models (Ideas section)
 * Renders simple geometric shapes with optional accent bar
 */

function BuildingGeometry({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale: customScale = 1.5,
  color = '#4CAF50',
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
}) {
  const materialColor = new THREE.Color(color);

  return (
    <group position={position} rotation={rotation} scale={customScale}>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color={materialColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[2, 0.1, 0.1]} />
        <meshStandardMaterial
          color={materialColor}
          emissive={materialColor}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

function UAVDroneGeometry({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale: customScale = 1.5,
  color = '#4CAF50',
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
}) {
  const materialColor = new THREE.Color(color);

  return (
    <group position={position} rotation={rotation} scale={customScale}>
      <mesh>
        <boxGeometry args={[1.5, 0.5, 1.5]} />
        <meshStandardMaterial color={materialColor} />
      </mesh>
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[1.5, 0.1, 0.1]} />
        <meshStandardMaterial
          color={materialColor}
          emissive={materialColor}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

function BookGeometry({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale: customScale = 1.5,
  color = '#4CAF50',
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
}) {
  const materialColor = new THREE.Color(color);

  return (
    <group position={position} rotation={rotation} scale={customScale}>
      <mesh>
        <boxGeometry args={[1, 1.5, 0.3]} />
        <meshStandardMaterial color={materialColor} />
      </mesh>
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[1, 0.1, 0.1]} />
        <meshStandardMaterial
          color={materialColor}
          emissive={materialColor}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

function IslandGeometry({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale: customScale = 1.5,
  color = '#4CAF50',
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
}) {
  const materialColor = new THREE.Color(color);

  return (
    <group position={position} rotation={rotation} scale={customScale}>
      <mesh>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color={materialColor} />
      </mesh>
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[1, 0.1, 0.1]} />
        <meshStandardMaterial
          color={materialColor}
          emissive={materialColor}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

/**
 * Main Model Renderer Component
 * Renders the appropriate model based on modelType
 */
export function ModelRenderer({
  modelType,
  textureUrl,
  color = '#4CAF50',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale,
  modelOffset = 0,
}: ModelRendererProps) {
  // Use modelOffset if position not explicitly provided (backward compatibility)
  const finalPosition: [number, number, number] = position[0] === 0 && position[1] === 0 && position[2] === 0
    ? [modelOffset, 0, 0]
    : position;

  const fallback = (
    <mesh position={finalPosition}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#666" />
    </mesh>
  );

  switch (modelType) {
    case 'tesla':
      return (
        <Suspense fallback={fallback}>
          <TeslaModel position={finalPosition} rotation={rotation} scale={scale} />
        </Suspense>
      );

    case 'renewed-vision':
    case 'skyline':
    case 'gcs':
      if (!textureUrl) {
        console.warn(`ModelRenderer: textureUrl required for ${modelType}`);
        return fallback;
      }
      return (
        <Suspense fallback={fallback}>
          <TextureLogoModel
            textureUrl={textureUrl}
            position={finalPosition}
            rotation={rotation}
            scale={scale}
          />
        </Suspense>
      );

    case 'neural-network':
      return (
        <Suspense fallback={fallback}>
          <NeuralNetworkModel position={finalPosition} rotation={rotation} scale={scale} />
        </Suspense>
      );

    case 'building':
      return (
        <BuildingGeometry
          position={finalPosition}
          rotation={rotation}
          scale={scale}
          color={color}
        />
      );

    case 'uav-drone':
      return (
        <UAVDroneGeometry
          position={finalPosition}
          rotation={rotation}
          scale={scale}
          color={color}
        />
      );

    case 'book':
      return (
        <BookGeometry
          position={finalPosition}
          rotation={rotation}
          scale={scale}
          color={color}
        />
      );

    case 'island':
      return (
        <IslandGeometry
          position={finalPosition}
          rotation={rotation}
          scale={scale}
          color={color}
        />
      );

    default:
      console.warn(`ModelRenderer: Unknown modelType ${modelType}`);
      return fallback;
  }
}

