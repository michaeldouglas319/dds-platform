"use client"

import { useRef, useState, ReactNode, useMemo } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useCursor, Image, Text, Html } from '@react-three/drei';
import { easing } from 'maath';

const GOLDENRATIO = 1.61803398875;

export interface FrameWithContentProps {
  /** Unique identifier for this frame */
  id: string;
  /** Title text displayed above the frame */
  title: string;
  /** Image URL for the frame */
  imageUrl: string;
  /** Position of the frame in 3D space */
  position?: [number, number, number];
  /** Rotation of the frame */
  rotation?: [number, number, number];
  /** React element to display in the responsive div (paper area) */
  content?: ReactNode;
  /** Optional 3D object to display instead of image */
  object?: ReactNode;
  /** Whether this frame is currently active */
  isActive?: boolean;
  /** Callback when frame is hovered */
  onHover?: (hovered: boolean) => void;
  /** Callback when frame is clicked */
  onClick?: () => void;
  /** Whether to show the paper/content area */
  showPaper?: boolean;
}

/**
 * Reusable Frame component with optional content area
 */
export function FrameWithContent({
  id,
  title,
  imageUrl,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  content,
  object,
  isActive = false,
  onHover,
  onClick,
  showPaper = true,
}: FrameWithContentProps) {
  const image = useRef<THREE.Mesh | THREE.Group | null>(null);
  const frame = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [rnd] = useState(() => Math.random());

  useCursor(hovered);

  const handleHover = (value: boolean) => {
    setHovered(value);
    onHover?.(value);
  };

  useFrame((state, dt) => {
    if (!image.current || !frame.current) return;

    // Type guard for image - check if it's a Mesh with material
    if ('material' in image.current && image.current.material && !object) {
      const material = image.current.material as THREE.Material & { zoom?: number };
      if ('zoom' in material && typeof material.zoom === 'number') {
        material.zoom = 2 + Math.sin(rnd * 10000 + state.clock.elapsedTime / 3) / 2;
      }
    }

    // Type guard for scale - check if it's a Mesh or Group with scale
    if ('scale' in image.current) {
      const hoverScale = !isActive && hovered ? 0.85 : 1;
      easing.damp3(
        image.current.scale,
        [0.85 * hoverScale, 0.9 * (!isActive && hovered ? 0.905 : 1), 1],
        0.1,
        dt
      );
    }

    if (frame.current.material && 'color' in frame.current.material) {
      easing.dampC(
        frame.current.material.color as THREE.Color,
        hovered ? 'orange' : 'white',
        0.1,
        dt
      );
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Image Frame */}
      <mesh
        name={id}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          handleHover(true);
        }}
        onPointerOut={() => handleHover(false)}
        onClick={onClick}
        scale={[1, GOLDENRATIO, 0.05]}
        position={[1.2, GOLDENRATIO / 2, 0]}
      >
        <boxGeometry />
        <meshStandardMaterial
          color="#151515"
          metalness={0.5}
          roughness={0.5}
          envMapIntensity={2}
        />
        <mesh
          ref={frame}
          scale={[0.9, 0.93, 0.9]}
          position={[0, 0, 0.2]}
          raycast={() => null}
        >
          <boxGeometry />
          <meshBasicMaterial 
            toneMapped={false} 
            fog={false}
          />
        </mesh>
        {object ? (
          <group ref={image} position={[0, 0, 0.7]}>
            {object}
          </group>
        ) : (
          <Image
            raycast={() => null}
            ref={image as React.Ref<THREE.Mesh>}
            url={imageUrl}
            position={[0, 0, 0.7]}
            scale={0.9}
          />
        )}
      </mesh>

      {/* Paper/Content area */}
      {showPaper && (
        <group position={[1.2, GOLDENRATIO / 2, 0]} rotation={[0, -0.1, 0]}>
          <mesh>
            <planeGeometry args={[0.8, GOLDENRATIO * 0.9]} />
            <meshStandardMaterial color="#fafafa" roughness={0.3} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[0.82, GOLDENRATIO * 0.92]} />
            <meshBasicMaterial color="#e5e5e5" transparent opacity={0.3} />
          </mesh>
          
          {content && (
            <Html
              position={[0, 0, 0.01]}
              transform
              occlude
              pointerEvents="auto"
              // scale to fit the 0.8 wide plane
              scale={0.001} 
              style={{
                width: '800px',
                height: '1450px',
                userSelect: 'none'
              }}
              wrapperClass="frame-content-wrapper"
            >
              <div className="bg-white/95 backdrop-blur-sm p-12 shadow-2xl overflow-y-auto w-full h-full border border-gray-200 text-black">
                {content}
              </div>
            </Html>
          )}
        </group>
      )}

      {/* Title text */}
      <Text
        maxWidth={0.1}
        anchorX="left"
        anchorY="top"
        position={[1.75, GOLDENRATIO, 0]}
        fontSize={0.025}
      >
        {title}
      </Text>
    </group>
  );
}




