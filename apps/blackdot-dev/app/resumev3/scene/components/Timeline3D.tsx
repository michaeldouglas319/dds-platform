"use client"

import { useRef, useMemo, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';
import type { JobSection } from '@/lib/config/content';

interface Timeline3DProps {
  jobs: JobSection[];
  selectedIndex: number;
  onJobClick?: (index: number) => void;
}

/**
 * Timeline3D Component
 * Creates an animated 3D timeline visualization
 * Clickable elements that trigger UI interactions
 */
export function Timeline3D({ jobs, selectedIndex, onJobClick }: Timeline3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Arrange jobs in a curved timeline
  const positions = useMemo(() => {
    return jobs.map((job, i) => {
      const angle = (i / (jobs.length - 1)) * Math.PI - Math.PI / 2;
      const radius = 2.5;
      
      return {
        x: Math.cos(angle) * radius,
        y: (i / (jobs.length - 1)) * 3 - 1.5,
        z: Math.sin(angle) * radius * 0.5,
        angle,
      };
    });
  }, [jobs]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Animate selected job to center
    const selectedPos = positions[selectedIndex];
    if (selectedPos) {
      easing.damp3(
        groupRef.current.position,
        [-selectedPos.x * 0.3, -selectedPos.y * 0.3, 0],
        0.3,
        delta
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 1]}>
      {/* Timeline line */}
      <mesh position={[0, 0, -0.5]}>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3(
            positions.map(p => new THREE.Vector3(p.x, p.y, p.z))
          ),
          100,
          0.02,
          8,
          false
        ]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.2}
        />
      </mesh>

      {jobs.map((job, index) => {
        const pos = positions[index];
        const isSelected = index === selectedIndex;
        const isHovered = hoveredIndex === index;
        
        return (
          <Float
            key={job.id}
            speed={isSelected ? 2 : 1}
            rotationIntensity={isSelected ? 0.3 : 0.1}
            floatIntensity={isSelected ? 0.4 : 0.2}
          >
            <group
              position={[pos.x, pos.y, pos.z]}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                e.nativeEvent.stopPropagation();
                onJobClick?.(index);
              }}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                setHoveredIndex(index);
              }}
              onPointerOut={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                setHoveredIndex(null);
              }}
            >
              {/* Company indicator sphere - Larger */}
              <mesh>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial
                  color={job.color}
                  metalness={0.6}
                  roughness={0.2}
                  emissive={job.color}
                  emissiveIntensity={isSelected ? 0.8 : isHovered ? 0.5 : 0.3}
                />
              </mesh>
              
              {/* Pulsing ring for selected */}
              {isSelected && (
                <mesh>
                  <ringGeometry args={[0.2, 0.25, 32]} />
                  <meshBasicMaterial
                    color={job.color}
                    transparent
                    opacity={0.5}
                  />
                </mesh>
              )}
              
              {/* Company name label - Larger */}
              <Text
                position={[0.4, 0, 0]}
                fontSize={0.18}
                color={isSelected ? job.color : '#ffffff'}
                anchorX="left"
                anchorY="middle"
                maxWidth={2}
                outlineWidth={0.02}
                outlineColor="#000000"
                fontWeight="bold"
              >
                {job.company}
              </Text>
              
              {/* Role label */}
              <Text
                position={[0.4, -0.2, 0]}
                fontSize={0.12}
                color={isSelected ? '#cccccc' : '#aaaaaa'}
                anchorX="left"
                anchorY="middle"
                maxWidth={2}
                outlineWidth={0.01}
                outlineColor="#000000"
              >
                {job.role}
              </Text>
              
              {/* Connection line to timeline */}
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[new Float32Array([
                      0, 0, 0,
                      -pos.x * 0.3, -pos.y * 0.3, -0.5 - pos.z * 0.3,
                    ]), 3]}
                    count={2}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color={isSelected ? job.color : '#444444'}
                  transparent
                  opacity={isSelected ? 0.8 : 0.3}
                />
              </line>
            </group>
          </Float>
        );
      })}
    </group>
  );
}

